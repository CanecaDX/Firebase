import * as React from "react";
import { View, Text, Button } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import CachorroManter from "./CachorroManter";
import CachorroListar from "./CachorroListar";
import RacaListar from "./RacaListar";
import RacaManter from "./RacaManter";

function ListarScreen({ navigation }) {
  return <CachorroListar></CachorroListar>;
}
function ManterScreen({ navigation }) {
  return <CachorroManter></CachorroManter>;
}

function ManterScreen2({ navigation }) {
  return <RacaManter></RacaManter>;
}

function ListarScreen2({ navigation }) {
  return <RacaListar></RacaListar>;
}

const Drawer = createDrawerNavigator();

export default function Menu() {
  return (
    <Drawer.Navigator initialRouteName="Manter Cachorro">
      <Drawer.Screen name="Manter Cachorro" component={ManterScreen} />
      <Drawer.Screen name="Listar Cachorro" component={ListarScreen} />
      <Drawer.Screen name="Listar Raca" component={ListarScreen2} />
      <Drawer.Screen name="Manter Raca" component={ManterScreen2} />
    </Drawer.Navigator>
  );
}
