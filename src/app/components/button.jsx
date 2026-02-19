export default function Button({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white w-full py-2 rounded mt-3"
    >
      {text}
    </button>
  );
}
