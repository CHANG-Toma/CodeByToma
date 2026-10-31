import Link from "next/link";
import {
  createBotTaskAction,
  setBotTaskStatusAction,
  updateBotTaskAction,
} from "@/app/(private)/actions";
import { TaskStatusSelect } from "@/components/dashboard/TaskStatusSelect";
import {
  EmptyState,
  Field,
  PageHeader,
  Panel,
  PrimaryButton,
  StatusBadge,
} from "@/components/dashboard/ui";
import { dashboardHref } from "@/lib/dashboard-href";
import { listClients } from "@/server/application/clients";
import { listBotTasks } from "@/server/application/tasks";
import {
  BOT_TASK_RESPONSIBLE_LABEL,
  BOT_TASK_STATUS_LABEL,
  BOT_TASK_RESPONSIBLES,
  BOT_TASK_STATUSES,
  type BotTaskResponsible,
  type BotTaskStatus,
} from "@/server/domain/tasks";
import { requireAdmin } from "@/server/infrastructure/auth/session";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ dashboardSlug: string }>;
  searchParams: Promise<{ status?: string; bot?: string; edit?: string }>;
};

function parseStatus(raw?: string): BotTaskStatus | undefined {
  return BOT_TASK_STATUSES.includes(raw as BotTaskStatus)
    ? (raw as BotTaskStatus)
    : undefined;
}

function parseBot(raw?: string): BotTaskResponsible | undefined {
  return BOT_TASK_RESPONSIBLES.includes(raw as BotTaskResponsible)
    ? (raw as BotTaskResponsible)
    : undefined;
}

export default async function TachesPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { dashboardSlug } = await params;
  const { status: statusRaw, bot: botRaw, edit } = await searchParams;
  const statusFilter = parseStatus(statusRaw);
  const botFilter = parseBot(botRaw);

  const [tasks, clients] = await Promise.all([
    listBotTasks({
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(botFilter ? { responsible: botFilter } : {}),
    }),
    listClients(),
  ]);

  const editing = edit ? tasks.find((t) => t.id === edit) : null;
  const clientName = new Map(
    clients.map((c) => [c.id, c.companyName || c.name]),
  );

  async function saveNew(formData: FormData) {
    "use server";
    await createBotTaskAction(formData);
  }

  async function saveEdit(formData: FormData) {
    "use server";
    if (!edit) return;
    await updateBotTaskAction(edit, formData);
  }

  async function changeStatus(taskId: string, status: BotTaskStatus) {
    "use server";
    return setBotTaskStatusAction(taskId, status);
  }

  const toValidateCount = tasks.filter((t) => t.status === "to_validate").length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tâches"
        description="Missions des bots et saisie manuelle. Les éléments « À valider » demandent ton arbitrage."
        actions={
          toValidateCount > 0 ? (
            <StatusBadge
              label={`${toValidateCount} à valider`}
              tone="warn"
            />
          ) : null
        }
      />

      <form method="get" className="flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={statusRaw ?? ""}
          className="rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
        >
          <option value="">Tous les statuts</option>
          {BOT_TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {BOT_TASK_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select
          name="bot"
          defaultValue={botRaw ?? ""}
          className="rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
        >
          <option value="">Tous les bots</option>
          {BOT_TASK_RESPONSIBLES.map((b) => (
            <option key={b} value={b}>
              {BOT_TASK_RESPONSIBLE_LABEL[b]}
            </option>
          ))}
        </select>
        <PrimaryButton>Filtrer</PrimaryButton>
      </form>

      <Panel>
        <h2 className="mb-4 text-sm font-medium text-dash-text">
          {editing ? "Modifier la tâche" : "Nouvelle tâche"}
        </h2>
        <form
          action={editing ? saveEdit : saveNew}
          className="grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <Field
              label="Mission (titre)"
              name="title"
              required
              defaultValue={editing?.title ?? ""}
            />
          </div>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block text-dash-muted">Détail</span>
            <textarea
              name="detail"
              rows={3}
              defaultValue={editing?.detail ?? ""}
              className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-dash-muted">Responsable</span>
            <select
              name="responsible"
              defaultValue={editing?.responsible ?? "toma"}
              className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
            >
              {BOT_TASK_RESPONSIBLES.map((b) => (
                <option key={b} value={b}>
                  {BOT_TASK_RESPONSIBLE_LABEL[b]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-dash-muted">Statut</span>
            <select
              name="status"
              defaultValue={editing?.status ?? "todo"}
              className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
            >
              {BOT_TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {BOT_TASK_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="Échéance"
            name="dueAt"
            type="datetime-local"
            defaultValue={
              editing?.dueAt
                ? editing.dueAt.toISOString().slice(0, 16)
                : ""
            }
          />
          <label className="block text-sm">
            <span className="mb-1.5 block text-dash-muted">Client (optionnel)</span>
            <select
              name="clientId"
              defaultValue={editing?.clientId ?? ""}
              className="w-full rounded-md border border-dash-border bg-dash-input px-3 py-2 text-sm text-dash-text"
            >
              <option value="">—</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName || c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <PrimaryButton>{editing ? "Enregistrer" : "Créer"}</PrimaryButton>
            {editing ? (
              <Link
                href={dashboardHref(dashboardSlug, "taches")}
                className="inline-flex items-center rounded-md border border-dash-border px-4 py-2 text-sm text-dash-soft hover:bg-dash-hover"
              >
                Annuler
              </Link>
            ) : null}
          </div>
        </form>
      </Panel>

      {tasks.length === 0 ? (
        <EmptyState
          title="Aucune tâche"
          description="Les bots peuvent en créer via l’API, ou ajoute-en une à la main ci-dessus."
        />
      ) : (
        <Panel className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-dash-border text-dash-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Mission</th>
                <th className="px-5 py-3 font-medium">Bot</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Échéance</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className={cn(
                    "border-b border-dash-border/60",
                    task.status === "to_validate" &&
                      "bg-amber-500/10 ring-1 ring-inset ring-amber-500/25",
                  )}
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-dash-text">{task.title}</p>
                    {task.detail ? (
                      <p className="mt-1 line-clamp-2 text-xs text-dash-muted">
                        {task.detail}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-dash-soft">
                    {BOT_TASK_RESPONSIBLE_LABEL[task.responsible]}
                  </td>
                  <td className="px-5 py-4">
                    <TaskStatusSelect
                      taskId={task.id}
                      value={task.status}
                      action={changeStatus}
                    />
                  </td>
                  <td className="px-5 py-4 text-dash-muted">
                    {task.dueAt
                      ? task.dueAt.toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-dash-muted">
                    {task.clientId
                      ? clientName.get(task.clientId) ?? "—"
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={dashboardHref(
                        dashboardSlug,
                        `taches?edit=${task.id}`,
                      )}
                      className="text-xs text-dash-soft hover:underline"
                    >
                      Éditer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
