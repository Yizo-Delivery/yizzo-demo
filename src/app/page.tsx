// Temporary start screen; Task 2 replaces it with the demo's layout and router
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12">
      <p className="text-3xl font-bold tracking-tight text-brand">Yizzo</p>
      <p className="text-lg">Send packages with travelers already heading there.</p>
      <div className="flex flex-col gap-3">
        <button className="min-h-11 rounded-2xl bg-brand px-5 py-4 text-left text-white">
          Diaspora: Washington → Addis
        </button>
        <button className="min-h-11 rounded-2xl border border-brand px-5 py-4 text-left text-brand">
          Domestic: Addis → Hawassa
        </button>
      </div>
      <p className="mt-auto text-sm text-stone-500">Demo with sample data</p>
    </main>
  );
}
