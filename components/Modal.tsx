"use client";

function Modal({
  title,
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className="relative left-[50%] top-[50%] z-50 grid w-[96vw] md:w-[1200px] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg">
        <div className="text-center">
          {title && <h3 className="text-2xl font-bold">{title}</h3>}
          <div className="mt-2 px-3 py-3 max-h-[75vh] overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
export default Modal;
