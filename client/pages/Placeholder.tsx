import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
}

const Placeholder = ({ title, description }: PlaceholderProps) => {
  return (
    <Layout>
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-lg bg-primary/10 p-4">
              <Zap className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="mb-3 text-3xl font-bold text-foreground">{title}</h1>
          <p className="mb-8 text-muted-foreground">{description}</p>
          <Link to="/">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Placeholder;
