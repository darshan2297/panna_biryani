export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-[#faf7f2]">
      <div className="w-12 h-12 rounded-full border-3 border-panna-gold/30 border-t-panna-gold animate-spin" />
      <p className="font-serif italic text-panna-deep text-sm">
        Preparing your royal experience...
      </p>
    </div>
  );
}
