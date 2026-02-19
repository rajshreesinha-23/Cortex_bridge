export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-3 flex justify-between">
      <h1 className="font-bold">Cortex Bridge</h1>
      <div>
        <a href="/login" className="mr-4">Login</a>
        <a href="/signup">Signup</a>
      </div>
    </nav>
  );
}
