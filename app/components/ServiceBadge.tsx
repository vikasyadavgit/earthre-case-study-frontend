import { serviceColor, serviceBg } from "../lib/utils";

interface Props {
  serviceId: string;
  serviceName?: string;
}

export default function ServiceBadge({ serviceId, serviceName }: Props) {
  const label = serviceName ?? serviceId;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: serviceBg(serviceId),
        color: serviceColor(serviceId),
        border: `1px solid ${serviceColor(serviceId)}33`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: serviceColor(serviceId),
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
