import { Link, useParams } from "react-router";
import { toolsList } from "../data/tools";
import { AdvancedMergePDFTool } from "../components/tools/AdvancedMergePDFTool";
import { UniversalToolWorkflow } from "../components/tools/UniversalToolWorkflow";

export default function ToolDetailPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolsList.find(item => item.id === toolId);

  if (!tool) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dn-t1)", background: "var(--dn-bg)", paddingTop: "80px" }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>Tool not found</h2>
          <Link to="/tools" style={{ color: "#3b82f6", textDecoration: "none" }}>Back to Tools</Link>
        </div>
      </div>
    );
  }

  if (tool.id === "merge-pdf") {
    return <AdvancedMergePDFTool tool={tool} />;
  }

  return <UniversalToolWorkflow tool={tool} />;
}
