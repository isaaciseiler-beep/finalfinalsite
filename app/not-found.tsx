import Container from "@/components/Container";

export default function NotFound() {
  return (
    <Container>
      <h1 className="text-2xl">not found</h1>
      <p className="text-mutefg">the page you requested does not exist.</p>
    </Container>
  );
}
