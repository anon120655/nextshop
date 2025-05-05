import { LoaderCircle } from "lucide-react";

export default function LoadingComponent() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center space-x-2 justify-center">
        <LoaderCircle className="animate-spin" />
        <span>Loading ...</span>
      </div>
    </div>
  );
}
