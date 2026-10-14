
import React, { useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  Landmark,
  Building2,
  Layers,
  FolderTree,
  Activity,
  GitBranch,
  Boxes,
  Clock,
  AlertCircle,
  RefreshCw,
  Download,
  Loader2,
  FileText,
} from "lucide-react";
import useDashboardStats from "../../hooks/usedashboardstats";

const COLORS = {
  primary: "#0E47C8",
  secondary: "#FF8500",
  primaryLight: "#0E47C820",
  secondaryLight: "#FF850020",
};

// ============================================================
// Composant KPI Card
// ============================================================
const KPICard = ({ title, value, icon: Icon, colorType }) => {
  const isPrimary = colorType === "primary";
  const mainColor = isPrimary ? COLORS.primary : COLORS.secondary;
  const bgLight = isPrimary ? COLORS.primaryLight : COLORS.secondaryLight;
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden group"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${bgLight} 0%, transparent 100%)` }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: bgLight }}
          >
            <Icon className="w-6 h-6" style={{ color: mainColor, strokeWidth: 1.5 }} />
          </div>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <span className="text-3xl font-bold text-gray-800">{value?.toLocaleString() || 0}</span>
      </div>
    </motion.div>
  );
};

// ============================================================
// Dashboard principal (sans la partie CLM / Contrats)
// ============================================================
const Dashboard = () => {
  const {
    counters,
    activitesBreakdown,
    bibStats,
    loading,
    error,
    lastUpdate,
    refreshData,
  } = useDashboardStats();

  const dashboardRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    const element = dashboardRef.current;
    if (!element) return;

    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 210;
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      let heightLeft = pdfHeight;
      let pageNum = 1;
      while (heightLeft > 297) {
        heightLeft -= 297;
        pageNum++;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -(pageNum - 1) * 297, pdfWidth, pdfHeight);
      }

      const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
      pdf.save(`Dashboard_${dateStr}.pdf`);
    } catch (err) {
      console.error("Erreur export PDF:", err);
      alert("Une erreur est survenue lors de l'export du PDF. Veuillez réessayer.");
    } finally {
      setExporting(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${COLORS.secondary} transparent transparent transparent` }}
          />
          <p className="text-gray-500">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 rounded-xl text-white"
            style={{ backgroundColor: COLORS.secondary }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b sticky top-0 z-10 backdrop-blur-sm bg-white/95"
        style={{ borderBottomColor: `${COLORS.primary}20` }}
      >
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
                Dashboard
              </h1>
              <p className="text-gray-500 mt-1">Vue d'ensemble de l'organigramme et des activités</p>
            </div>
            <div className="flex items-center gap-4">
              {lastUpdate && (
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
                </div>
              )}
              <button
                onClick={refreshData}
                className="px-4 py-2 rounded-xl text-gray-600 transition-colors flex items-center gap-2 text-sm"
                style={{ backgroundColor: `${COLORS.primary}10` }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rafraîchir
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-3 py-1.5 rounded-lg text-white transition-all flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                style={{ backgroundColor: COLORS.secondary }}
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Génération...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div ref={dashboardRef} className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        {/* ============================================================
            Hiérarchie organisationnelle
        ============================================================ */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Organigramme
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Directions Centrales"
            value={counters.directionsCentrales}
            icon={Landmark}
            colorType="primary"
          />
          <KPICard title="Directions" value={counters.directions} icon={Building2} colorType="secondary" />
          <KPICard title="Départements" value={counters.departements} icon={FolderTree} colorType="primary" />
        </div>

        {/* ============================================================
            Hiérarchie activités
        ============================================================ */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Activités
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <KPICard title="Activités" value={counters.activites} icon={Activity} colorType="secondary" />
          <KPICard
            title="Directions Activité"
            value={counters.directionsActivite}
            icon={GitBranch}
            colorType="primary"
          />
          <KPICard
            title="Départements Activité"
            value={counters.departementsActivite}
            icon={Layers}
            colorType="secondary"
          />
          <KPICard title="Divisions" value={counters.divisions} icon={Boxes} colorType="primary" />
          <KPICard
            title="Départements de division"
            value={counters.departementsDivision}
            icon={FolderTree}
            colorType="primary"
          />
        </div>

        {/* ============================================================
            Bibliothèque juridique
        ============================================================ */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-8">
          Bibliothèque Juridique
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Documents Juridiques"
            value={bibStats?.total}
            icon={FileText}
            colorType="primary"
          />
          {bibStats?.parCategorie?.map((item, index) => (
            <KPICard
              key={item._id}
              title={item._id?.replaceAll("_", " ")}
              value={item.total}
              icon={FileText}
              colorType={index % 2 === 0 ? "secondary" : "primary"}
            />
          ))}
        </div>

        {bibStats?.parCategorie?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Documents par Catégorie
            </h3>
            <div className="space-y-3">
              {bibStats.parCategorie.map((item) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item._id}</span>
                  <span className="text-sm font-semibold text-gray-800">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;