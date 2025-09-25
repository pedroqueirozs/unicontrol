import { useEffect, useState } from "react";
import { db } from "@/services/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

interface Shipment {
  shipping_date: Timestamp;
  delivery_forecast: Timestamp;
  delivery_date?: Timestamp | null;
  transporter: string;
}

interface GeneralStats {
  totalSent: number;
  totalDelivered: number;
  totalOverdue: number;
  totalInTransit: number;
  deliveryRate: number;
}

interface MonthlyStats {
  month: string;
  sent: number;
  delivered: number;
}

interface TransporterStats {
  name: string;
  percentage: number;
}

export function useDashboardStats() {
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [transporterStats, setTransporterStats] = useState<TransporterStats[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      const currentDate = new Date();
      const pastDate = new Date();
      pastDate.setMonth(currentDate.getMonth() - 5);

      const q = query(
        collection(db, "goods_shipped"),
        where("shipping_date", ">=", Timestamp.fromDate(pastDate)),
        where("shipping_date", "<=", Timestamp.fromDate(currentDate))
      );

      const snapshot = await getDocs(q);
      const docs: Shipment[] = snapshot.docs.map(
        (doc) => doc.data() as Shipment
      );

      console.log("Dados Brutos", docs);
      //KPIs gerais
      const general = calculateGeneralStats(docs, currentDate);
      setGeneralStats(general);

      //Estatísticas por mês
      const monthly = calculateMonthlyStats(docs);
      setMonthlyStats(monthly);

      //Estatísticas por transportadora
      const transporter = calculateTransporterStats(docs, general.totalSent);
      setTransporterStats(transporter);

      setLoading(false);
    }

    fetchStats();
  }, []);

  return { generalStats, monthlyStats, transporterStats, loading };
}

function calculateGeneralStats(
  docs: Shipment[],
  currentDate: Date
): GeneralStats {
  const totalSent = docs.length;
  let totalDelivered = 0;
  let totalOverdue = 0;
  let totalInTransit = 0;

  docs.forEach((doc) => {
    if (doc.delivery_date) {
      totalDelivered++;
    } else {
      if (doc.delivery_forecast.toDate() < currentDate) {
        totalOverdue++;
      } else {
        totalInTransit++;
      }
    }
  });

  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

  return {
    totalSent,
    totalDelivered,
    totalOverdue,
    totalInTransit,
    deliveryRate,
  };
}

// Estatísticas por mês
function calculateMonthlyStats(docs: Shipment[]): MonthlyStats[] {
  const monthlyMap: { [key: string]: { sent: number; delivered: number } } = {};

  docs.forEach((doc) => {
    //Mês de envio
    const sentMonth = dayjs(doc.shipping_date.toDate()).format("YYYY-MM");
    if (!monthlyMap[sentMonth]) {
      monthlyMap[sentMonth] = { sent: 0, delivered: 0 };
    }
    monthlyMap[sentMonth].sent++;

    //Mês de entrega
    if (doc.delivery_date) {
      const deliveredMonth = dayjs(doc.delivery_date.toDate()).format(
        "YYYY-MM"
      );
      if (!monthlyMap[deliveredMonth]) {
        monthlyMap[deliveredMonth] = { sent: 0, delivered: 0 };
      }
      monthlyMap[deliveredMonth].delivered++;
    }
  });

  const orderedMonths = Object.keys(monthlyMap).sort();

  return orderedMonths.map((key) => ({
    month: dayjs(key).format("MMM/YYYY"),
    sent: monthlyMap[key].sent,
    delivered: monthlyMap[key].delivered,
  }));
}

// Estatísticas por transportadora
function calculateTransporterStats(
  docs: Shipment[],
  totalSent: number
): TransporterStats[] {
  const transporterCount: { [key: string]: number } = {};

  docs.forEach((doc) => {
    transporterCount[doc.transporter] =
      (transporterCount[doc.transporter] || 0) + 1;
  });

  return Object.entries(transporterCount).map(([name, count]) => ({
    name,
    percentage: totalSent > 0 ? (count / totalSent) * 100 : 0,
  }));
}
