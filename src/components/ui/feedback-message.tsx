type FeedbackMessageProps = {
  error?: string;
  success?: string;
};

export function FeedbackMessage({ error, success }: FeedbackMessageProps) {
  if (!error && !success) {
    return null;
  }

  return (
    <div
      className={`mt-4 rounded-md border px-3 py-2 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ?? success}
    </div>
  );
}
