export const dynamic = "force-static";
import Container from "@/components/Container";

export default function Contact() {
  return (
    <Container>
      <h1 className="mb-4 text-3xl">contact</h1>
      <form
        className="card p-6 space-y-4"
        action="https://formsubmit.co/isaaciseiler@gmail.com"
        method="POST"
      >
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_subject" value="new message from isaac-bw-site" />
        <label className="block text-sm">
          name
          <input
            className="mt-1 w-full rounded-xl border border-border bg-transparent p-2 outline-none focus-visible:ring-2"
            type="text"
            name="name"
            required
            autoComplete="name"
          />
        </label>
        <label className="block text-sm">
          email
          <input
            className="mt-1 w-full rounded-xl border border-border bg-transparent p-2 outline-none focus-visible:ring-2"
            type="email"
            name="email"
            required
            autoComplete="email"
          />
        </label>
        <label className="block text-sm">
          message
          <textarea
            className="mt-1 w-full rounded-xl border border-border bg-transparent p-2 outline-none focus-visible:ring-2"
            name="message"
            rows={6}
            required
          />
        </label>
        <button
          type="submit"
          className="rounded-xl border border-border bg-white px-4 py-2 text-black transition hover:opacity-90"
        >
          send
        </button>
      </form>
      <p className="mt-3 text-xs text-mutefg">
        uses formsubmit free tier. to change the target email, edit the form action.
      </p>
    </Container>
  );
}
