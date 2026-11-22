
import { useEffect, useMemo, useState } from "react";
import { Search, Building2, Users, RefreshCw } from "lucide-react";
import companyService from "../../services/companyService";

export default function Departments() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDepartments = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await companyService.getCompanyEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load company employee records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const departments = useMemo(() => {
    const grouped = {};

    employees.forEach((employee) => {
      const name = employee.department?.trim();

      if (!name) return;

      grouped[name] = (grouped[name] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([name, count]) => ({
        name,
        employees: count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalAssigned = departments.reduce(
    (total, department) => total + department.employees,
    0
  );

  return (
    <div className="dept-page">
      <style>{`
        .dept-page {
          width: 100%;
          color: var(--text, #202536);
        }
        .dept-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 24px;
        }
        .dept-heading h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }
        .dept-heading p {
          margin: 0;
          color: var(--muted, #7a8192);
          font-size: 14px;
        }
        .dept-refresh {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: var(--card, white);
          color: var(--text, #202536);
          cursor: pointer;
        }
        .dept-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }
        .dept-stat {
          padding: 20px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
        }
        .dept-stat-label {
          color: var(--muted, #7a8192);
          font-size: 13px;
        }
        .dept-stat-value {
          margin-top: 8px;
          font-size: 26px;
          font-weight: 700;
        }
        .dept-toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 17px;
        }
        .dept-search {
          position: relative;
          flex: 1;
        }
        .dept-search svg {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted, #7a8192);
        }
        .dept-input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px 11px 40px;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 8px;
          background: var(--card, white);
          color: var(--text, #202536);
          outline: none;
        }
        .dept-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border, #e7e9f0);
          border-radius: 12px;
          background: var(--card, white);
        }
        .dept-table {
          width: 100%;
          border-collapse: collapse;
        }
        .dept-table th, .dept-table td {
          padding: 15px 16px;
          border-bottom: 1px solid var(--border, #e7e9f0);
          text-align: left;
          font-size: 13px;
        }
        .dept-table th {
          background: var(--bg, #f6f7fb);
          color: var(--muted, #7a8192);
          font-weight: 600;
        }
        .dept-name {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
        }
        .dept-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 9px;
          background: var(--soft-primary, #efedff);
          color: var(--primary, #6558d3);
        }
        .dept-empty {
          padding: 35px !important;
          text-align: center !important;
          color: var(--muted, #7a8192);
        }
        .dept-error {
          margin-bottom: 15px;
          padding: 12px;
          border-radius: 8px;
          background: #fceaea;
          color: #c43d3d;
        }
        @media (max-width: 700px) {
          .dept-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dept-heading">
        <div>
          <h2>Departments</h2>
          <p>Departments identified from your company's employee records.</p>
        </div>

        <button
          className="dept-refresh"
          onClick={loadDepartments}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="dept-stats">
        <div className="dept-stat">
          <div className="dept-stat-label">Total Departments</div>
          <div className="dept-stat-value">{departments.length}</div>
        </div>

        <div className="dept-stat">
          <div className="dept-stat-label">Employees with Department</div>
          <div className="dept-stat-value">{totalAssigned}</div>
        </div>

        <div className="dept-stat">
          <div className="dept-stat-label">Employees Loaded</div>
          <div className="dept-stat-value">{employees.length}</div>
        </div>
      </div>

      {error && <div className="dept-error">{error}</div>}

      <div className="dept-toolbar">
        <div className="dept-search">
          <Search size={17} />
          <input
            className="dept-input"
            placeholder="Search department..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="dept-table-wrap">
        <table className="dept-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Employees</th>
              <th>Source</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="dept-empty">
                  Loading company departments...
                </td>
              </tr>
            ) : filteredDepartments.length > 0 ? (
              filteredDepartments.map((department) => (
                <tr key={department.name}>
                  <td>
                    <div className="dept-name">
                      <span className="dept-icon">
                        <Building2 size={17} />
                      </span>
                      {department.name}
                    </div>
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", gap: 6 }}>
                      <Users size={15} />
                      {department.employees}
                    </span>
                  </td>
                  <td>Company employee records</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="dept-empty">
                  {employees.length === 0
                    ? "No employee department records available."
                    : "No matching departments found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
