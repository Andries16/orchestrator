import Chip from '@mui/material/Chip';
export type StatusType = "success" | "error" | "processing";
interface StatusBadgeProps {
  status: StatusType;
}
export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getColors = () => {
    switch (status) {
      case "success":
        return {
          bg: "rgba(34, 197, 94, 0.1)",
          color: "#4ade80",
          border: "rgba(34, 197, 94, 0.2)",
          label: "SUCCES",
        };
      case "error":
        return {
          bg: "rgba(239, 68, 68, 0.1)",
          color: "#f87171",
          border: "rgba(239, 68, 68, 0.2)",
          label: "EROARE",
        };
      case "processing":
        return {
          bg: "rgba(234, 179, 8, 0.1)",
          color: "#facc15",
          border: "rgba(234, 179, 8, 0.2)",
          label: "PROCESARE",
        };
    }
  };
  const colors = getColors();
  return (
    <Chip
      label={colors.label}
      size="small"
      sx={{
        height: 18,
        fontSize: "9px",
        fontWeight: 700,
        bgcolor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        borderRadius: "4px",
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
};
