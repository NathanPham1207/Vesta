import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-neutral-50">
      <Container>
        <TopBar />

        <Card>
          <CardHeader
            title="What can you cook today?"
            subtitle="Snap your fridge. Confirm ingredients. Get smart meal picks."
          />
          <CardBody>
            <div className="flex flex-col gap-3">
              <Link href="/scan">
                <Button className="w-full">Scan my fridge</Button>
              </Link>

              <Link href="/confirm">
                <Button variant="secondary" className="w-full">
                  Enter ingredients manually (demo)
                </Button>
              </Link>

              <div className="mt-2 flex flex-wrap gap-2">
                <Chip>Smart ranking</Chip>
                <Chip>Missing ingredients</Chip>
                <Chip>Substitutions</Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="mt-4 text-xs text-black/50">
          Tip: For the fastest demo, scan → confirm → results.
        </div>
      </Container>
    </div>
  );
}
