// À ajouter dans ton fichier axios/api existant de cette plateforme
// (ex: dashboardApi.js ou recapApi.js), en gardant le même axiosInstance
// que tes autres appels (voir Activite, Direction, etc.).

import axiosInstance from "./axios";

export const fetchDashboardCounters = () =>
  axiosInstance.get("/juridique/dashboard/counters/");

export const fetchDirectionsParDirectionCentrale = () =>
  axiosInstance.get("/juridique/dashboard/directions-par-direction-centrale/");

export const fetchActivitesBreakdown = () =>
  axiosInstance.get("/juridique/dashboard/activites-breakdown/");

export const fetchBibStats = () =>
  axiosInstance.get("/bib/stats/");
export const fetchClmStats = () =>
  axiosInstance.get("/clm/dashboard/stats/");