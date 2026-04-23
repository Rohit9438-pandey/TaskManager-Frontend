import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Task {
  id: number;
  title: string;
  description: string;
}

export default function App() {
  // 🔐 Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token")
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);


  // 📦 Task state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const API =  `${BASE_URL}/api/task`;

  // 🔐 LOGIN FUNCTION
 const login = async () => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error();

    const token = await res.text();

    // 🔥 CLEAR OLD DATA FIRST
    localStorage.removeItem("token");
    setTasks([]);

    // 🔐 SET NEW TOKEN
    localStorage.setItem("token", token);

    setIsLoggedIn(true);

    // 🔥 FETCH NEW USER TASKS
    await fetchTasks();

    toast.success("Login successful 🎉");
  } catch {
    toast.error("Invalid credentials ❌");
  }
};


  const register = async () => {
  try {
    await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    toast.success("Registered successfully 🎉");
    setIsRegister(false);
  } catch {
    toast.error("Register failed ❌");
  }
};


  // 🔓 LOGOUT
 const logout = () => {
  localStorage.removeItem("token");
  setTasks([]);       
  setUsername("");     
  setPassword("");     
  setIsLoggedIn(false);
};

  // 📥 FETCH TASKS
const fetchTasks = async () => {
  try {
    const res = await fetch(API, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    setTasks(data);
  } catch {
    setTasks([]); 
  }
};

 useEffect(() => {
  if (isLoggedIn) {
    setTasks([]);   
    fetchTasks();
  }
}, [isLoggedIn]);

  // ➕ CREATE / UPDATE
  const saveTask = async () => {
    if (!title) return;

    try {
      if (editId !== null) {
        await fetch(`${API}/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ title, description }),
        });
        toast.success("Task updated ✅");
      } else {
        await fetch(API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ title, description }),
        });
        toast.success("Task added 🎉");
      }

      setTitle("");
      setDescription("");
      setEditId(null);
      setShowModal(false);
      fetchTasks();
    } catch {
      toast.error("Error saving task ❌");
    }
  };

  // ❌ DELETE
  const deleteTask = async (id: number) => {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    toast.success("Deleted 🗑️");
    fetchTasks();
  };

  // ✏️ EDIT
  const openEditModal = (task: Task) => {
    setTitle(task.title);
    setDescription(task.description);
    setEditId(task.id);
    setShowModal(true);
  };

  // 🔴 LOGIN UI
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <Toaster />
        <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-center">Login 🔐</h2>

          <input
            className="w-full border p-2 mb-3 rounded"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-2 mb-3 rounded"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

         <button
           onClick={isRegister ? register : login}
           className="w-full bg-indigo-600 text-white p-2 rounded"
          >
            {isRegister ? "Register" : "Login"}
    </button>

   <p
      className="text-sm mt-3 text-center cursor-pointer text-blue-500"
      onClick={() => setIsRegister(!isRegister)}
    >
  {isRegister
    ? "Already have account? Login"
    : "New user? Register"}
   </p>         
        </div>
      </div>
    );
  }

  // 🟢 MAIN APP UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <Toaster />

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-xl">
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">Task Manager 🚀</h1>
          <button onClick={logout} className="text-red-500">
            Logout
          </button>
        </div>

        {/* SEARCH */}
        <input
          className="w-full border p-2 mb-4 rounded"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => setShowModal(true)}
          className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + Add Task
        </button>

        {/* TASK LIST */}
        <div className="space-y-3">
          {tasks
            .filter((task) =>
              task.title.toLowerCase().includes(search.toLowerCase())
            )
            .map((task) => (
              <div
                key={task.id}
                className="flex justify-between bg-gray-100 p-4 rounded-xl"
              >
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-gray-500">
                    {task.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(task)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-xl mb-3">
              {editId ? "Edit Task" : "Add Task"}
            </h2>

            <input
              className="w-full border p-2 mb-2 rounded"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              className="w-full border p-2 mb-2 rounded"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={saveTask}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}