const StatusBadge = ({ status }) => {
  let config = { bg: "bg-secondary", text: "text-white" };

  switch(status?.toUpperCase()) {
    case 'DRAFT':
      config = { bg: "bg-surface-container-highest", text: "text-secondary" };
      break;
    case 'SUBMITTED':
      config = { bg: "bg-blue-100", text: "text-blue-700" };
      break;
    case 'VERIFIED':
    case 'APPROVED':
      config = { bg: "bg-green-100", text: "text-green-700" };
      break;
    case 'REJECTED':
      config = { bg: "bg-red-100", text: "text-red-700" };
      break;
    case 'ENROLLED':
      config = { bg: "bg-primary/20", text: "text-primary" };
      break;
    default:
      config = { bg: "bg-secondary/20", text: "text-secondary" };
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
