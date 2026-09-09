import { FaFacebookF, FaInstagram } from "react-icons/fa";

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/tomkynssealantservices/",
    icon: FaInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/tomkynssealantservices",
    icon: FaFacebookF,
  },
];

export default function SocialLinks({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-semibold ${dark ? "text-white" : "text-foreground"}`}>
        Follow us
      </span>
      {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Tomkyns Sealant Services on ${label}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}