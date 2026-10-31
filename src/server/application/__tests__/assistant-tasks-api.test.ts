import { beforeEach, describe, expect, it, vi } from "vitest";
import { patchAssistantTask } from "../tasks";

const mockFindByExternalId = vi.fn();
const mockUpsert = vi.fn();
const mockFindById = vi.fn();
const mockAppend = vi.fn();

vi.mock("../container", () => ({
  deps: {
    botTasks: {
      findByExternalId: (...args: unknown[]) => mockFindByExternalId(...args),
      upsertByExternalId: (...args: unknown[]) => mockUpsert(...args),
      findById: (...args: unknown[]) => mockFindById(...args),
    },
    clients: {
      findById: vi.fn().mockResolvedValue({ id: "c1" }),
    },
    audit: {
      append: (...args: unknown[]) => mockAppend(...args),
    },
  },
}));

describe("patchAssistantTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crée une tâche si externalId inconnu", async () => {
    mockFindByExternalId.mockResolvedValue(null);
    mockUpsert.mockResolvedValue({
      id: "t1",
      externalId: "bot-1",
      title: "Mission",
      responsible: "marketing",
      status: "todo",
    });

    const task = await patchAssistantTask({
      externalId: "bot-1",
      title: "Mission",
      responsible: "marketing",
    });

    expect(task.id).toBe("t1");
    expect(mockUpsert).toHaveBeenCalled();
    expect(mockAppend).toHaveBeenCalled();
  });

  it("met à jour sans exiger title si la tâche existe", async () => {
    mockFindByExternalId.mockResolvedValue({
      id: "t1",
      externalId: "bot-1",
      title: "Mission",
      detail: null,
      responsible: "marketing",
      status: "todo",
      dueAt: null,
      clientId: null,
    });
    mockUpsert.mockResolvedValue({
      id: "t1",
      externalId: "bot-1",
      status: "in_progress",
    });

    await patchAssistantTask({
      externalId: "bot-1",
      status: "in_progress",
    });

    expect(mockUpsert).toHaveBeenCalled();
  });

  it("rejette une création sans title", async () => {
    mockFindByExternalId.mockResolvedValue(null);
    await expect(
      patchAssistantTask({
        externalId: "bot-2",
        status: "todo",
      }),
    ).rejects.toThrow(/title/i);
  });
});
