import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldQuestion } from "lucide-react";

const NotFound = () => (
  <div className="container flex min-h-[80vh] pt-20 flex-col items-center justify-center px-4 text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <ShieldQuestion className="h-8 w-8" />
    </div>
    <h1 className="mt-6 text-5xl font-bold tracking-tight">404</h1>
    <p className="mt-3 text-lg text-muted-foreground">This page doesn't exist — but your data is still safe.</p>
    <div className="mt-8 flex gap-3">
      <Button asChild className="bg-gradient-primary"><Link to="/">Go home</Link></Button>
      <Button asChild variant="outline"><Link to="/tools">Try free tools</Link></Button>
    </div>
  </div>
);

export default NotFound;
