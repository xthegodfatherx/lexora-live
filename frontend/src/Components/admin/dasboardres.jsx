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
  FileSignature,
  ShieldAlert,
} from "lucide-react";
import useDashboardStats from "../../hooks/usedashboardstats";

const COLORS = {
  primary: "#0E47C8",
  secondary: "#FF8500",
  primaryLight: "#0E47C820",
  secondaryLight: "#FF850020",
};

const SEVERITE_COLORS = {
  critique: "#DC2626",
  eleve: "#F97316",
  moyen: "#EAB308",
  faible: "#22C55E",
};

// ============================================================
// Composant KPI Card (responsive: padding et tailles réduites sur mobile)
// ============================================================
const KPICard = ({ title, value, icon: Icon, colorType }) => {
  const isPrimary = colorType === "primary";
  const mainColor = isPrimary ? COLORS.primary : COLORS.secondary;
  const bgLight = isPrimary ? COLORS.primaryLight : COLORS.secondaryLight;
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-xl overflow-hidden group"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${bgLight} 0%, transparent 100%)` }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: bgLight }}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: mainColor, strokeWidth: 1.5 }} />
          </div>
        </div>
        <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1 break-words">{title}</h3>
        <span className="text-2xl sm:text-3xl font-bold text-gray-800">
          {value?.toLocaleString() || 0}
        </span>
      </div>
    </motion.div>
  );
};

// ============================================================
// Évolution mensuelle des contrats (barres horizontales, responsive)
// ============================================================
const EvolutionMensuelleChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxTotal = Math.max(...data.map((m) => m.total || 0), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
        Évolution des Contrats (6 derniers mois)
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => {
          let label = item.mois;
          try {
            label = new Date(item.mois).toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            });
          } catch {
            // garde la valeur brute si le parsing échoue
          }
          return (
            <motion.div
              key={item.mois || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-0.5 sm:gap-0">
                <span className="text-sm font-medium text-gray-700 capitalize">{label}</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                  {item.total} contrat{item.total > 1 ? "s" : ""} —{" "}
                  {Number(item.montant || 0).toLocaleString()} DZD
                </span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.total / maxTotal) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.08 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================
// Dashboard principal (responsive, avec la partie CLM / Contrats)
// ============================================================
const Dashboard = () => {
  const {
    counters,
    activitesBreakdown,
    bibStats,
    clmStats,
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${COLORS.secondary} transparent transparent transparent` }}
          />
          <p className="text-gray-500 text-sm sm:text-base">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-sm w-full">
          <AlertCircle className="w-14 h-14 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-500 text-sm sm:text-base">{error}</p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 rounded-xl text-white text-sm sm:text-base"
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
      {/* HEADER — s'empile en colonne sur mobile, s'aligne en ligne à partir de sm */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b sticky top-0 z-10 backdrop-blur-sm bg-white/95"
        style={{ borderBottomColor: `${COLORS.primary}20` }}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.primary }}>
                Dashboard
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Vue d'ensemble de l'organigramme et des activités
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {lastUpdate && (
                <div className="text-xs sm:text-sm text-gray-400 flex items-center gap-2 order-3 sm:order-none w-full sm:w-auto">
                  <Clock className="w-4 h-4 shrink-0" />
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString("fr-FR")}
                </div>
              )}
              <button
                onClick={refreshData}
                className="px-3 sm:px-4 py-2 rounded-xl text-gray-600 transition-colors flex items-center gap-2 text-xs sm:text-sm"
                style={{ backgroundColor: `${COLORS.primary}10` }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Rafraîchir</span>
                <span className="xs:hidden">Actualiser</span>
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-3 py-1.5 rounded-lg text-white transition-all flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm"
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

      <div
        ref={dashboardRef}
        className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-gray-100"
      >
        {/* ============================================================
            Hiérarchie organisationnelle
        ============================================================ */}
        <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Organigramme
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
        <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Activités
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-6 sm:mb-8">
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
        <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6 sm:mt-8">
          Bibliothèque Juridique
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
              Documents par Catégorie
            </h3>
            <div className="space-y-3">
              {bibStats.parCategorie.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-600 break-words">{item._id}</span>
                  <span className="text-sm font-semibold text-gray-800 shrink-0">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            Contrats (CLM)
        ============================================================ */}
        <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6 sm:mt-8">
          Gestion des Contrats
        </h2>

        {/* KPIs principaux — Contrats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <KPICard
            title="Contrats"
            value={clmStats?.total}
            icon={FileSignature}
            colorType="primary"
          />
          <KPICard
            title="Contrats en Retard"
            value={clmStats?.enRetard}
            icon={AlertCircle}
            colorType="secondary"
          />
          <KPICard
            title="Risques Critiques"
            value={clmStats?.risques?.critiques}
            icon={ShieldAlert}
            colorType="primary"
          />
          <KPICard
            title="Expirant sous 30 jours"
            value={clmStats?.expirantBientot}
            icon={Clock}
            colorType="primary"
          />
          <KPICard
            title="Contrats Expirés (non clôturés)"
            value={clmStats?.expires}
            icon={AlertCircle}
            colorType="secondary"
          />
        </div>

        {/* Répartitions Statut / Type */}
        {(clmStats?.parStatut?.length > 0 || clmStats?.parType?.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {clmStats?.parStatut?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
                  Contrats par Statut
                </h3>
                <div className="space-y-3">
                  {clmStats.parStatut.map((item) => (
                    <div key={item.statut} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-600 capitalize break-words">{item.statut}</span>
                      <span className="text-sm font-semibold text-gray-800 shrink-0">{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {clmStats?.parType?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
                  Contrats par Type
                </h3>
                <div className="space-y-3">
                  {clmStats.parType.map((item) => (
                    <div key={item.type_contrat} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-600 capitalize break-words">
                        {item.type_contrat}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 shrink-0">{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Risques — Par Type / Par Sévérité */}
        {(clmStats?.risques?.parType?.length > 0 || clmStats?.risques?.parSeverite?.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {clmStats?.risques?.parType?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
                  Risques par Type
                </h3>
                <div className="space-y-3">
                  {clmStats.risques.parType.map((item) => {
                    const TYPE_LABELS = {
                      retard: "Retard",
                      imprecision: "Imprécision",
                      different: "Différend",
                    };
                    const TYPE_COLORS = {
                      retard: "#F97316",
                      imprecision: "#EAB308",
                      different: "#0E47C8",
                    };
                    return (
                      <div key={item.type_risque} className="flex items-center justify-between gap-3">
                        <span className="text-sm text-gray-600 flex items-center gap-2 break-words">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: TYPE_COLORS[item.type_risque] || COLORS.primary }}
                          />
                          {TYPE_LABELS[item.type_risque] || item.type_risque}
                        </span>
                        <span className="text-sm font-semibold text-gray-800 shrink-0">{item.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {clmStats?.risques?.parSeverite?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
                  Risques par Sévérité
                </h3>
                <div className="space-y-3">
                  {clmStats.risques.parSeverite.map((item) => (
                    <div key={item.severite} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-600 capitalize flex items-center gap-2 break-words">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: SEVERITE_COLORS[item.severite] || COLORS.primary,
                          }}
                        />
                        {item.severite}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 shrink-0">{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contrats à Risque (au moins 1 risque critique non résolu) */}
        {clmStats?.contratsARisque?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
              Contrats à Risque Critique
            </h3>
            <div className="space-y-3">
              {clmStats.contratsARisque.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 break-words">{c.titre}</p>
                    <p className="text-xs text-gray-400 break-words">
                      {c.numero_contrat} — <span className="capitalize">{c.statut}</span>
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 self-start sm:self-auto shrink-0">
                    {c.risques_critiques} risque{c.risques_critiques > 1 ? "s" : ""} critique
                    {c.risques_critiques > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Départements */}
        {clmStats?.topDepartements?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
              Top Départements (par nombre de contrats)
            </h3>
            <div className="space-y-3">
              {clmStats.topDepartements.map((item, index) => (
                <div key={item.departement_id || index} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-600 break-words">{item.departement_id || "N/A"}</span>
                  <span className="text-sm font-semibold text-gray-800 shrink-0">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Évolution mensuelle des contrats */}
        <EvolutionMensuelleChart data={clmStats?.evolutionMensuelle} />

        {/* Contrats récents */}
        {clmStats?.dernierContrats?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
              Derniers Contrats
            </h3>
            <div className="space-y-3">
              {clmStats.dernierContrats.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 break-words">{c.titre}</p>
                    <p className="text-xs text-gray-400">{c.numero_contrat}</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {Number(c.montant || 0).toLocaleString()} DZD
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{c.statut}</p>
                  </div>
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