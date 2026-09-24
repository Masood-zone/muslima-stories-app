import { Library } from "@/components/library";
import { stories } from "@/lib/stories";

export default function Home() {
  return <Library stories={stories} />;
}
