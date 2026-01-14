import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-300 font-display selection:bg-primary/30 selection:text-white transition-colors duration-300">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
