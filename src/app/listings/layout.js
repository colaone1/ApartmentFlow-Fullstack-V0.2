import Sidebar from "../components/Sidebar";

export default function ListingsLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar/>
      <main className=" w-full p-6">{children}</main>
    </div>
  );
}
