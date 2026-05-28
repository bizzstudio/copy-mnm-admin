import { TableBody, TableCell, TableRow, Badge, Button } from "@windmill/react-ui";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const AgentTable = ({ agents, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <TableBody>
      {agents.map((a) => (
        <TableRow key={a._id}>
          <TableCell>
            <span className="text-sm font-medium">{a.name}</span>
          </TableCell>
          <TableCell>
            <span className="text-sm">{a.phone}</span>
          </TableCell>
          <TableCell>
            <span className="text-xs">{a.email || "-"}</span>
          </TableCell>
          <TableCell>
            <span className="text-xs font-mono">
              {a.maxDiscountPercent || 0}%
            </span>
          </TableCell>
          <TableCell>
            <span className="text-xs font-mono">
              ₪{(a.targets?.monthly || 0).toLocaleString()}
            </span>
          </TableCell>
          <TableCell>
            {a.isActive ? (
              <Badge type="success">{t("Active")}</Badge>
            ) : (
              <Badge type="danger">{t("Inactive")}</Badge>
            )}
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Button
                layout="link"
                size="icon"
                aria-label={t("Edit")}
                onClick={() => onEdit(a._id)}
              >
                <FiEdit className="text-customGreen-dark" />
              </Button>
              <Button
                layout="link"
                size="icon"
                aria-label={t("Delete")}
                onClick={() => onDelete(a._id, a.name)}
              >
                <FiTrash2 className="text-red-500" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
};

export default AgentTable;
