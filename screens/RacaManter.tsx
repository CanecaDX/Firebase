import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Text,
  Pressable,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Alert,
  ScrollView,
} from "react-native";
import { auth, firestore, storage } from "../firebase";
import meuestilo from "../meuestilo";
import { Raca } from "../model/Raca";
import { uploadBytes } from "firebase/storage";
import { FlatList } from "react-native-gesture-handler";

const RacaManter = (props) => {
  const [formRaca, setFormRaca] = useState<Partial<Raca>>({});
  const navigation = useNavigation();
  const [racas, setRaca] = useState<Raca[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const racaRef = firestore
    .collection("Usuario")
    .doc(auth.currentUser?.uid)
    .collection("Raca");

  const limparFormulario = () => {
    setFormRaca({});
  };

  const cancelar = () => {
    setFormRaca({});
  };

  const salvar = async () => {
    const raca = new Raca(formRaca);

    console.log(raca.id);

    if (raca.id === undefined) {
      const racaRefComId = racaRef.doc();
      raca.id = racaRefComId.id;

      racaRefComId.set(raca.toFirestore()).then(() => {
        alert("Raca " + raca.nome + " adicionado!");
        limparFormulario();
      });
    } else {
      const racaRefComId = racaRef.doc(raca.id);
      racaRefComId.update(raca.toFirestore()).then(() => {
        alert("Raca " + raca.nome + " atualizado!");
        limparFormulario();
      });
    }
  };

  useEffect(() => {
    const subscriber = racaRef.onSnapshot((querySnapshot) => {
      const racas = [];
      querySnapshot.forEach((documentSnapshot) => {
        racas.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
        });
      });
      setRaca(racas);
      setLoading(false);
      setIsRefreshing(false);
    });
    return () => subscriber();
  }, [racas]);

  const editRaca = async (raca: Raca) => {
    const result = firestore
      .collection("Usuario")
      .doc(auth.currentUser?.uid)
      .collection("Raca")
      .doc(raca.id)
      .onSnapshot((documentSnapshot) => {
        const raca = new raca(documentSnapshot.data());
        setFormRaca(raca);
        console.log(raca);
      });
    return () => result();
  };

  const deleteRaca = async (raca: Raca) => {
    Alert.alert(
      `Apagar raca "${raca.raca}?" `,
      "Essa ação não pode ser desfeita!",
      [
        {
          text: "Cancelar",
        },
        {
          text: "Excluir",
          onPress: async () => {
            const res = await racaRef
              .doc(raca.id)
              .delete()
              .then(() => {
                alert("Raca " + raca.raca + " excluído!");
                limparFormulario();
                setIsRefreshing(true);
              });
          },
        },
      ]
    );
  };

  const renderRacas = ({ item }: { item: Raca }) => {
    return (
      <View style={meuestilo.item} key={item.id}>
        <Pressable
          onLongPress={() => deleteRaca(item)}
          onPress={() => editRaca(item)}
        >
          <View style={meuestilo.alinhamentoLinha}>
            <View style={meuestilo.alinhamentoColuna}>
              <Text style={meuestilo.title}>Raça: {item.raca}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <ScrollView>
      <KeyboardAvoidingView>
        <View style={meuestilo.inputContainer}>
          <TextInput
            placeholder="Raca"
            style={meuestilo.input}
            value={formRaca.raca}
            onChangeText={(raca) =>
              setFormRaca({
                ...formRaca,
                raca: raca,
              })
            }
          />
        </View>

        <View style={meuestilo.buttonContainer}>
          <TouchableOpacity onPress={cancelar} style={meuestilo.button}>
            <Text style={meuestilo.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={salvar}
            style={[meuestilo.button, meuestilo.buttonOutline]}
          >
            <Text style={meuestilo.buttonOutlineText}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={racas}
          renderItem={renderRacas}
          keyExtractor={(item) => item.id.toString()}
          refreshing={isRefreshing}
        />
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default RacaManter;
