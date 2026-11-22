
import { useMemo, useState } from "react";
import {
  Search,
  BriefcaseBusiness,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Eye,
  X,
  Circle,
  PlayCircle,
  CheckCheck,
} from "lucide-react";

const initialTasks = [
  {
    id: 1,
    title: "Develop Employee Dashboard",
    description:
      "Complete the employee dashboard interface and ensure all dashboard components are responsive.",
    project: "OrgConnect HRMS",
    assignedBy: "Rahul Sharma",
    assignedDate: "2026-10-20",
    dueDate: "2026-11-02",
    priority: "High",
    status: "In Progress",
  },
  {
    id: 2,
    title: "Update Employee Documentation",
    description:
      "Review and update the employee onboarding documentation with the latest process information.",
    project: "HR Documentation",
    assignedBy: "Priya Reddy",
    assignedDate: "2026-10-22",
    dueDate: "2026-11-04",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: 3,
    title: "Prepare Monthly Report",
    description:
      "Prepare the monthly activity report and submit it to the reporting manager.",
    project: "Monthly Reporting",
    assignedBy: "Arjun Kumar",
    assignedDate: "2026-10-15",
    dueDate: "2026-10-29",
    priority: "High",
    status: "Completed",
  },
  {
    id: 4,
    title: "Review UI Components",
    description:
      "Review the reusable UI components and identify areas for improvement.",
    project: "OrgConnect HRMS",
    assignedBy: "Rahul Sharma",
    assignedDate: "2026-10-25",
    dueDate: "2026-11-06",
    priority: "Low",
    status: "Pending",
  },
  {
    id: 5,
    title: "Test Leave Application",
    description:
      "Test the employee leave application flow and report any functional issues.",
    project: "Employee Module",
    assignedBy: "Priya Reddy",
    assignedDate: "2026-10-26",
    dueDate: "2026-11-01",
    priority: "Medium",
    status: "In Progress",
  },
];

const statusOptions = ["Pending", "In Progress", "Completed"];

function formatDate(date) {
  if (!date) return "--";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPriorityClass(priority) {
  return priority.toLowerCase();
}

function getStatusClass(status) {
  return status.toLowerCase().replace(" ", "-");
}

export default function MyWork() {
  const [tasks, setTasks] = useState(initialTasks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTask, setSelectedTask] = useState(null);

  const filteredTasks = useMemo(() => {
    const value = search.toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(value) ||
        task.project.toLowerCase().includes(value) ||
        task.assignedBy.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const pendingCount = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const totalTasks = tasks.length;

  const completionPercentage =
    totalTasks > 0
      ? Math.round((completedCount / totalTasks) * 100)
      : 0;

  const updateTaskStatus = (id, status) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, status } : task
      )
    );

    setSelectedTask((previous) =>
      previous?.id === id ? { ...previous, status } : previous
    );
  };

  const summaryCards = [
    {
      label: "Total Tasks",
      value: totalTasks,
      subtitle: "Assigned to you",
      icon: BriefcaseBusiness,
      color: "#6558d3",
      background: "#efedff",
    },
    {
      label: "Pending Tasks",
      value: pendingCount,
      subtitle: "Not yet started",
      icon: Clock,
      color: "#c17b17",
      background: "#fff4df",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      subtitle: "Currently working",
      icon: AlertCircle,
      color: "#2477bd",
      background: "#e8f3ff",
    },
    {
      label: "Completed",
      value: completedCount,
      subtitle: "Finished tasks",
      icon: CheckCircle,
      color: "#16834b",
      background: "#e7f8ef",
    },
  ];

  return (
    <div className="my-work-page">
      <style>{`
        .my-work-page {
          width: 100%;
          color: var(--emp-text, #202536);
        }

        .work-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 24px;
        }

        .work-heading h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .work-heading p {
          margin: 0;
          color: var(--emp-muted, #7a8192);
          font-size: 14px;
        }

        .work-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .work-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 19px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .work-card-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .work-card-label {
          color: var(--emp-muted, #7a8192);
          font-size: 13px;
        }

        .work-card-value {
          margin-top: 5px;
          font-size: 24px;
          font-weight: 700;
        }

        .work-card-subtitle {
          margin-top: 3px;
          color: var(--emp-muted, #7a8192);
          font-size: 11px;
        }

        .work-progress {
          padding: 18px;
          margin-bottom: 20px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .work-progress-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .work-progress-title {
          font-size: 14px;
          font-weight: 600;
        }

        .work-progress-value {
          font-size: 18px;
          font-weight: 700;
          color: #6558d3;
        }

        .work-progress-track {
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: var(--emp-hover, #ececf3);
        }

        .work-progress-fill {
          height: 100%;
          border-radius: 20px;
          background: #6558d3;
          transition: width 0.3s ease;
        }

        .work-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 17px;
        }

        .work-search {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .work-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--emp-muted, #7a8192);
        }

        .work-input,
        .work-select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 8px;
          background: var(--emp-input, white);
          color: var(--emp-text, #202536);
          outline: none;
        }

        .work-search .work-input {
          padding-left: 40px;
        }

        .work-filter {
          width: 175px;
        }

        .work-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 12px;
          background: var(--emp-card, white);
        }

        .work-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .work-table th,
        .work-table td {
          padding: 15px 16px;
          border-bottom: 1px solid var(--emp-border, #e7e9f0);
          text-align: left;
          font-size: 13px;
        }

        .work-table th {
          background: var(--emp-hover, #f6f7fb);
          color: var(--emp-muted, #7a8192);
          font-weight: 600;
        }

        .work-table tbody tr:last-child td {
          border-bottom: none;
        }

        .work-task-title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .work-muted {
          color: var(--emp-muted, #7a8192);
          font-size: 12px;
        }

        .work-priority,
        .work-status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .work-priority.high {
          background: #fceaea;
          color: #c43d3d;
        }

        .work-priority.medium {
          background: #fff4df;
          color: #a76b12;
        }

        .work-priority.low {
          background: #e8f3ff;
          color: #2477bd;
        }

        .work-status.pending {
          background: #fff4df;
          color: #a76b12;
        }

        .work-status.in-progress {
          background: #e8f3ff;
          color: #2477bd;
        }

        .work-status.completed {
          background: #e7f8ef;
          color: #16834b;
        }

        .work-status-select {
          min-width: 130px;
          padding: 7px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 7px;
          background: var(--emp-input, white);
          color: var(--emp-text, #202536);
        }

        .work-view {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 7px;
          background: transparent;
          color: var(--emp-text, #202536);
          cursor: pointer;
          font-size: 12px;
        }

        .work-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--emp-muted, #7a8192);
        }

        .work-note {
          margin-top: 16px;
          color: var(--emp-muted, #7a8192);
          font-size: 12px;
        }

        .work-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(15, 20, 35, 0.55);
        }

        .work-modal {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 14px;
          background: var(--emp-card, white);
          color: var(--emp-text, #202536);
        }

        .work-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .work-modal-header h3 {
          margin: 0;
          font-size: 19px;
        }

        .work-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: 1px solid var(--emp-border, #e7e9f0);
          border-radius: 8px;
          background: transparent;
          color: var(--emp-text, #202536);
          cursor: pointer;
        }

        .work-detail {
          padding: 12px 0;
          border-bottom: 1px solid var(--emp-border, #e7e9f0);
        }

        .work-detail:last-child {
          border-bottom: none;
        }

        .work-detail-label {
          margin-bottom: 5px;
          color: var(--emp-muted, #7a8192);
          font-size: 12px;
        }

        .work-detail-value {
          font-size: 14px;
          font-weight: 500;
        }

        .work-modal-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .work-primary-btn {
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          background: #6558d3;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .work-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .work-summary {
            grid-template-columns: 1fr;
          }

          .work-filter {
            width: 100%;
          }

          .work-modal {
            padding: 18px;
          }
        }
      `}</style>

      <div className="work-heading">
        <div>
          <h2>My Work</h2>
          <p>View your assigned tasks and track your work progress.</p>
        </div>
      </div>

      <div className="work-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="work-card" key={card.label}>
              <div
                className="work-card-icon"
                style={{
                  background: card.background,
                  color: card.color,
                }}
              >
                <Icon size={21} />
              </div>

              <div>
                <div className="work-card-label">{card.label}</div>
                <div className="work-card-value">{card.value}</div>
                <div className="work-card-subtitle">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="work-progress">
        <div className="work-progress-top">
          <span className="work-progress-title">
            Overall Task Completion
          </span>
          <span className="work-progress-value">
            {completionPercentage}%
          </span>
        </div>

        <div className="work-progress-track">
          <div
            className="work-progress-fill"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="work-toolbar">
        <div className="work-search">
          <Search size={17} />
          <input
            className="work-input"
            placeholder="Search task, project or assigned by..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <select
          className="work-select work-filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          className="work-select work-filter"
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="work-table-wrap">
        <table className="work-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Project</th>
              <th>Assigned By</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Update Status</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className="work-task-title">{task.title}</div>
                    <div className="work-muted">
                      Assigned {formatDate(task.assignedDate)}
                    </div>
                  </td>
                  <td>{task.project}</td>
                  <td>{task.assignedBy}</td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td>
                    <span
                      className={`work-priority ${getPriorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`work-status ${getStatusClass(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="work-status-select"
                      value={task.status}
                      onChange={(event) =>
                        updateTaskStatus(task.id, event.target.value)
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="work-view"
                      onClick={() => setSelectedTask(task)}
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="work-empty">
                  <BriefcaseBusiness size={25} />
                  <p>No assigned tasks found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="work-note">
        Demo data: Tasks and status updates are stored only in this page's
        current session. They are not connected to the backend.
      </p>

      {selectedTask && (
        <div
          className="work-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTask(null);
            }
          }}
        >
          <div
            className="work-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="work-modal-title"
          >
            <div className="work-modal-header">
              <h3 id="work-modal-title">Task Details</h3>

              <button
                className="work-close"
                onClick={() => setSelectedTask(null)}
                aria-label="Close task details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="work-detail">
              <div className="work-detail-label">Task Title</div>
              <div className="work-detail-value">
                {selectedTask.title}
              </div>
            </div>

            <div className="work-detail">
              <div className="work-detail-label">Description</div>
              <div className="work-detail-value">
                {selectedTask.description}
              </div>
            </div>

            <div className="work-detail">
              <div className="work-detail-label">Project</div>
              <div className="work-detail-value">
                {selectedTask.project}
              </div>
            </div>

            <div className="work-detail">
              <div className="work-detail-label">Assigned By</div>
              <div className="work-detail-value">
                {selectedTask.assignedBy}
              </div>
            </div>

            <div className="work-detail">
              <div className="work-detail-label">Assigned Date</div>
              <div className="work-detail-value">
                {formatDate(selectedTask.assignedDate)}
              </div>
            </div>

            <div className="work-detail">
              <div className="work-detail-label">Due Date</div>
              <div className="work-detail-value">
                {formatDate(selectedTask.dueDate)}
              </div>
            </div>

            <div className="work-detail">
              <div className="work-detail-label">Priority</div>
              <div className="work-detail-value">
                {selectedTask.priority}
              </div>
            </div>

            <div className="work-detail">
              <div className="work-detail-label">Current Status</div>
              <select
                className="work-select"
                value={selectedTask.status}
                onChange={(event) =>
                  updateTaskStatus(selectedTask.id, event.target.value)
                }
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="work-modal-footer">
              <button
                className="work-primary-btn"
                onClick={() => setSelectedTask(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
