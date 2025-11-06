import { ScrollView } from "react-native";
import Contenedor from "../Contenedor/Contenedor";
import useFetchWarehouses from "@/hooks/useFetchWarehouses";

export default function Refrigeradores() {
  const contenedores = useFetchWarehouses();

  return (
    <ScrollView
      bounces={true}
      className="h-dvh"
      style={{ flex: 1, marginBottom: "auto" }}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {contenedores.map((contenedor, index) => (
        <Contenedor key={index} contenedor={contenedor} />
      ))}
    </ScrollView>
  );
}
