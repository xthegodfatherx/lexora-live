import { useState, useEffect, useCallback } from "react";

import {
  fetchDashboardCounters,
  fetchDirectionsParDirectionCentrale,
  fetchActivitesBreakdown,
  fetchBibStats,
  fetchClmStats,
} from "../dashboardapi";

const useDashboardStats = (autoFetch = true) => {
  const [counters, setCounters] = useState({
    directionsCentrales: 0,
    directions: 0,
    departements: 0,
    activites: 0,
    directionsActivite: 0,
    departementsActivite: 0,
    divisions: 0,
    directionsDivision: 0,
    departementsDivision: 0,
    structures: 0,
  });

  const [directionsParDC, setDirectionsParDC] = useState([]);
  const [activitesBreakdown, setActivitesBreakdown] = useState(null);
  const [bibStats, setBibStats] = useState(null);
  const [clmStats, setClmStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingCounters, setLoadingCounters] = useState(false);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchCountersOnly = useCallback(async () => {
    setLoadingCounters(true);
    try {
      const response = await fetchDashboardCounters();
      console.log("📊 Réponse Dashboard API :", response.data);

      if (response.data?.success) {
        const data = response.data.data || {};
        setCounters({
          directionsCentrales: data.directionsCentrales || 0,
          directions: data.directions || 0,
          departements: data.departements || 0,
          activites: data.activites || 0,
          directionsActivite: data.directionsActivite || 0,
          departementsActivite: data.departementsActivite || 0,
          divisions: data.divisions || 0,
          directionsDivision: data.directionsDivision || 0,
          departementsDivision: data.departementsDivision || 0,
          structures: data.structures || 0,
        });
      }
    } catch (err) {
      console.error("❌ Erreur chargement compteurs:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoadingCounters(false);
    }
  }, []);

  // const fetchBreakdownOnly = useCallback(async () => {
  //   setLoadingBreakdown(true);

  //   try {
  //     // ── 👇 fetchBibStats isolé avec ses propres logs ──────────────
  //     console.log("🔵 [BIB] Envoi requête fetchBibStats()...");
  //     let bibRes;
  //     try {
  //       bibRes = await fetchBibStats();
  //       console.log("🔵 [BIB] Statut HTTP :", bibRes.status);
  //       console.log("🔵 [BIB] Réponse complète :", bibRes.data);
  //     } catch (bibErr) {
  //       console.error("🔴 [BIB] ÉCHEC de la requête fetchBibStats()");
  //       console.error("🔴 [BIB] Statut HTTP :", bibErr.response?.status);
  //       console.error("🔴 [BIB] Corps de la réponse d'erreur :", bibErr.response?.data);
  //       console.error("🔴 [BIB] Message :", bibErr.message);
  //       bibRes = null;
  //     }

  //     const [dcRes, actRes, clmRes] = await Promise.all([
  //       fetchDirectionsParDirectionCentrale(),
  //       fetchActivitesBreakdown(),
  //       fetchClmStats(),
  //     ]);

  //     if (dcRes.data?.success) setDirectionsParDC(dcRes.data.data || []);
  //     if (actRes.data?.success) setActivitesBreakdown(actRes.data.data || null);

  //     if (bibRes?.data?.success) {
  //       console.log("🟢 [BIB] Données stockées dans bibStats :", bibRes.data.data);
  //       setBibStats(bibRes.data.data || null);
  //     } else {
  //       console.warn("🟡 [BIB] Aucune donnée valide reçue — bibStats reste null");
  //     }

  //     if (clmRes.data?.success) setClmStats(clmRes.data.data || null);
  //   } catch (err) {
  //     console.error("❌ Erreur chargement breakdown:", err);
  //   } finally {
  //     setLoadingBreakdown(false);
  //   }
  // }, []);
const fetchBreakdownOnly = useCallback(async () => {
  setLoadingBreakdown(true);

  const results = await Promise.allSettled([
    fetchBibStats(),
    fetchDirectionsParDirectionCentrale(),
    fetchActivitesBreakdown(),
    fetchClmStats(),
  ]);

  const [bibResult, dcResult, actResult, clmResult] = results;

  // --- BIB ---
  if (bibResult.status === "fulfilled" && bibResult.value?.data?.success) {
    console.log("🟢 [BIB] Données stockées dans bibStats :", bibResult.value.data.data);
    setBibStats(bibResult.value.data.data || null);
  } else {
    console.warn("🟡 [BIB] Échec ou données invalides — bibStats reste inchangé", bibResult.reason);
  }

  // --- Directions par DC ---
  if (dcResult.status === "fulfilled" && dcResult.value?.data?.success) {
    setDirectionsParDC(dcResult.value.data.data || []);
  } else {
    console.warn("🟡 [DC] Échec fetchDirectionsParDirectionCentrale", dcResult.reason);
  }

  // --- Activités ---
  if (actResult.status === "fulfilled" && actResult.value?.data?.success) {
    setActivitesBreakdown(actResult.value.data.data || null);
  } else {
    console.warn("🟡 [ACT] Échec fetchActivitesBreakdown", actResult.reason);
  }

  // --- CLM ---
  if (clmResult.status === "fulfilled" && clmResult.value?.data?.success) {
    setClmStats(clmResult.value.data.data || null);
  } else {
    console.warn("🟡 [CLM] Échec fetchClmStats", clmResult.reason);
  }

  setLoadingBreakdown(false);
}, []);
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchCountersOnly(), fetchBreakdownOnly()]);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("❌ Erreur rafraîchissement dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchCountersOnly, fetchBreakdownOnly]);

  useEffect(() => {
    if (autoFetch) {
      refreshData();
    }
  }, [autoFetch, refreshData]);

  return {
    counters,
    directionsParDC,
    activitesBreakdown,
    bibStats,
    clmStats,
    loading,
    loadingCounters,
    loadingBreakdown,
    error,
    lastUpdate,
    refreshData,
  };
};

export default useDashboardStats;