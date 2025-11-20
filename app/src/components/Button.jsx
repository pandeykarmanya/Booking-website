export default function Button({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-linear-to-r from-[#780218]/80 to-[#9a031e]/70 text-white py-2 rounded-lg hover:opacity-90 transition font-semibold"
    >
      {text}
    </button>
  );
}
