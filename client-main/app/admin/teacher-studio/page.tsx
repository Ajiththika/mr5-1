import { Suspense } from "react";
import TeacherStudioPage from "./TeacherStudioClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <TeacherStudioPage />
    </Suspense>
  );
}
