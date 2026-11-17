import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../db/client';
import { sendNotification } from '../services/notification.service';

interface Project {
  id: number;
  name: string;
  workspaceId: number;
  archived: boolean;
}

interface ReportTask {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'doing' | 'done';
  assigneeId: number | null;
  dueDate: string | null;
}

interface EnrichedTask extends ReportTask {
  assigneeName: string;
}

interface ReportOptions {
  projectId: number;
  tz: string;
  includeArchived: boolean;
  groupBy: string;
  startDate?: string;
  endDate?: string;
}

interface ReportOutput {
  rows: string[];
  total: number;
  completionRate: number;
}

type TaskBuckets = Record<string, EnrichedTask[]>;

function readReportOptions(req: Pick<Request, 'params' | 'query'>): ReportOptions {
  return {
    projectId: Number(req.params.projectId),
    tz: (req.query.tz as string) || 'UTC',
    includeArchived: req.query.includeArchived === 'true',
    groupBy: (req.query.groupBy as string) || 'status',
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
  };
}

function findProject(projectId: number): Project | undefined {
  return db.find('projects', (row) => row.id === projectId) as Project | undefined;
}

function listProjectTasks(projectId: number): ReportTask[] {
  return db.list('tasks', (row) => row.projectId === projectId) as unknown as ReportTask[];
}

function filterTasksByDateRange(
  tasks: ReportTask[],
  startDate?: string,
  endDate?: string,
): ReportTask[] {
  let filtered = tasks;

  if (startDate) {
    const start = new Date(startDate).getTime();
    filtered = filtered.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).getTime() >= start;
    });
  }

  if (endDate) {
    const end = new Date(endDate).getTime();
    filtered = filtered.filter((task) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).getTime() <= end;
    });
  }

  return filtered;
}

function enrichTasksWithAssignees(tasks: ReportTask[]): EnrichedTask[] {
  return tasks.map((task) => {
    let assigneeName = 'unassigned';

    if (task.assigneeId !== null) {
      const user = db.find('users', (row) => row.id === task.assigneeId) as
        | { name: string }
        | undefined;

      if (user) assigneeName = user.name;
    }

    return { ...task, assigneeName };
  });
}

function calculateCompletionRate(tasks: EnrichedTask[]): number {
  if (tasks.length === 0) return 0;

  const completed = tasks.filter((task) => task.status === 'done').length;
  return Math.round((completed / tasks.length) * 100);
}

function buildTaskBuckets(tasks: EnrichedTask[], groupBy: string): TaskBuckets {
  const buckets: TaskBuckets = {};

  for (const task of tasks) {
    const key =
      groupBy === 'status'
        ? task.status
        : groupBy === 'assignee'
          ? task.assigneeName
          : 'all';

    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(task);
  }

  return buckets;
}

function formatDateInTimeZone(iso: string | null, tz: string): string {
  if (!iso) return '';

  try {
    const date = new Date(iso);
    if (tz === 'UTC') return date.toISOString().slice(0, 10);
    return date.toLocaleDateString('en-US', { timeZone: tz });
  } catch {
    return iso;
  }
}

function buildCsvRows(
  projectName: string,
  buckets: TaskBuckets,
  options: {
    generatedAt: string;
    completionRate: number;
    total: number;
    tz: string;
  },
): string[] {
  const rows = [
    `# Project Report: ${projectName}`,
    `# Generated: ${options.generatedAt}`,
    `# Completion rate: ${options.completionRate}%`,
    `# Total tasks: ${options.total}`,
    '',
    ['Bucket', 'TaskId', 'Title', 'Status', 'Assignee', 'DueDate'].join(','),
  ];

  for (const [bucket, tasks] of Object.entries(buckets)) {
    for (const task of tasks) {
      rows.push(
        [
          bucket,
          String(task.id),
          `"${task.title.replace(/"/g, '""')}"`,
          task.status,
          `"${task.assigneeName}"`,
          formatDateInTimeZone(task.dueDate, options.tz),
        ].join(','),
      );
    }
  }

  return rows;
}

function assembleProjectReport(project: Project, options: ReportOptions): ReportOutput {
  const tasks = filterTasksByDateRange(
    listProjectTasks(project.id),
    options.startDate,
    options.endDate,
  );
  const enrichedTasks = enrichTasksWithAssignees(tasks);
  const total = enrichedTasks.length;
  const completionRate = calculateCompletionRate(enrichedTasks);
  const buckets = buildTaskBuckets(enrichedTasks, options.groupBy);
  const rows = buildCsvRows(project.name, buckets, {
    generatedAt: new Date().toISOString(),
    completionRate,
    total,
    tz: options.tz,
  });

  return { rows, total, completionRate };
}

function notifyReportGenerated(
  projectName: string,
  total: number,
  completionRate: number,
): void {
  sendNotification({
    to: 'reports@orbittasks.local',
    subject: `Report generated for ${projectName}`,
    body: `${total} tasks, ${completionRate}% complete`,
  });
}

function sendCsvResponse(res: Response, projectName: string, rows: string[]): void {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${projectName.replace(/\s+/g, '_')}.csv"`,
  );
  res.send(rows.join('\n'));
}

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

reportsRouter.get('/project/:projectId.csv', async (req, res) => {
  const options = readReportOptions(req);
  const project = findProject(options.projectId);

  if (!project) {
    res.status(404).json({ error: 'project not found' });
    return;
  }

  if (project.archived && !options.includeArchived) {
    res.status(404).json({ error: 'project archived' });
    return;
  }

  const report = assembleProjectReport(project, options);
  notifyReportGenerated(project.name, report.total, report.completionRate);
  sendCsvResponse(res, project.name, report.rows);
});