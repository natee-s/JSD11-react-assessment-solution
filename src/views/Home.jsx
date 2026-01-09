import { useEffect, useState } from "react";
import { UserTable } from "../components/UserTable";
import { AdminTable } from "../components/AdminTable";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

export default function Home() {
  const { user, authLoading, apiBase } = useOutletContext();
  const [view, setView] = useState(null);
  const [users, setUsers] = useState([]);

  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState(null);
  const [askResult, setAskResult] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(apiBase);
      setUsers(res.data.data);
    } catch {
      alert("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const askAi = async (e) => {
    e.preventDefault();
    const q = String(question || "").trim();

    if (!q) return;

    setAskLoading(true);
    setAskError(null);
    setAskResult(null);

    try {
      const response = await axios.post(
        `${apiBase}`,
        { question: q, topK: 5 },
        { withCredentials: true }
      );
      setAskResult(response.data.data || null);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        error?.message;
      setAskError(message || "failed to ask AI");
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 gap-y-6 flex flex-col justify-start w-full">
      <section className="mt-20 text-5xl font-extrabold text-center">
        <h1>Generation Thailand</h1>
        <h1>React Assessment</h1>
      </section>
      <section className="flex justify-center gap-x-3 font-bold">
        <button
          onClick={() => setView("user")}
          className=" p-5 bg-sky-200 flex rounded-2xl cursor-pointer border hover:bg-sky-300"
        >
          User Section
        </button>
        <button
          onClick={() => setView("admin")}
          className=" p-5 bg-rose-100 flex rounded-2xl cursor-pointer border hover:bg-rose-200"
        >
          Admin Section
        </button>
      </section>
      <section>
        <div>Ask AI about users</div>
        {authLoading ? (
          <div>Checking login...</div>
        ) : user ? (
          <form onSubmit={askAi}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Who are admins?"
            />
            <button type="submit" disabled={askLoading}>
              {askLoading ? "Asking..." : "Ask"}
            </button>
          </form>
        ) : (
          <div>Please login to use the AI feature</div>
        )}
        {askError ? <div>{askError}</div> : null}
        {askResult ? (
          <div>
            <div>Answer</div>
            <div>{askResult.answer || "(no answer)"}</div>
            <div>Sources</div>
            {Array.isArray(askResult.sources) && askResult.sources.length ? (
              <ul>
                {askResult.sources.map((s) => {
                  <li key={s._id}>
                    {s.username} ({s.role}) - {s.email}
                  </li>;
                })}
              </ul>
            ) : (
              <div>No sources found.</div>
            )}
          </div>
        ) : null}
      </section>
      <section className="w-full flex justify-center gap-x-3">
        {view === "user" ? (
          <section className=" p-5  flex">
            <UserTable users={users} />
          </section>
        ) : view === "admin" ? (
          <section className=" p-5  flex">
            {authLoading ? (
              <div>Checking user auth...</div>
            ) : user ? (
              <AdminTable
                users={users}
                setUsers={setUsers}
                fetchUsers={fetchUsers}
                API={apiBase}
              />
            ) : (
              <div>Please login to access Admin Section</div>
            )}
          </section>
        ) : null}
      </section>
    </div>
  );
}
