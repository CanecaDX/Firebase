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
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { auth, firestore, storage } from "../firebase";
import meuestilo from "../meuestilo";
import { Cachorro } from "../model/Cachorro";
import * as ImagePicker from "expo-image-picker";
import { uploadBytes } from "firebase/storage";
import { FlatList } from "react-native-gesture-handler";

const ManterCachorro = (props) => {
  const [formCachorro, setFormCachorro] = useState<Partial<Cachorro>>({});
  const navigation = useNavigation();
  const [cachorros, setCachorros] = useState<Cachorro[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(true);

  const [pickerImagePath, setPickerImagePath] = useState("");

  const cachorroRef = firestore
    .collection("Usuario")
    .doc(auth.currentUser?.uid)
    .collection("Cachorro");

  const limparFormulario = () => {
    setFormCachorro({});
    setPickerImagePath("");
  };

  const cancelar = () => {
    setFormCachorro({});
    setPickerImagePath("");
  };

  const salvar = async () => {
    const cachorro = new Cachorro(formCachorro);

    console.log(cachorro.id);

    if (cachorro.id === undefined) {
      const cachorroRefComId = cachorroRef.doc();
      cachorro.id = cachorroRefComId.id;

      cachorroRefComId.set(cachorro.toFirestore()).then(() => {
        alert("Cachorro " + cachorro.nome + " adicionado!");
        limparFormulario();
      });
    } else {
      const cachorroRefComId = cachorroRef.doc(cachorro.id);
      cachorroRefComId.update(cachorro.toFirestore()).then(() => {
        alert("Cachorro " + cachorro.nome + " atualizado!");
        limparFormulario();
      });
    }
  };

  const escolheFoto = () => {
    Alert.alert(
      "Titulo",
      "Mensagem",
      [
        {
          text: "Tirar foto",
          onPress: () => openCamera(),
          style: "default",
        },
        {
          text: "Abrir galeria",
          onPress: () => showImagePicker(),
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {},
      }
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permissão recusada!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    //console.log(result);

    enviarImagem(result);
  };

  const showImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permissão de acesso a galeria recusada!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    //console.log(result);
    enviarImagem(result);
  };

  const enviarImagem = async (result) => {
    if (!result.canceled) {
      setPickerImagePath(result.assets[0].uri);
      const uploadUri = result.assets[0].uri;
      let filename = uploadUri.substring(uploadUri.lastIndexOf("/") + 1);
      const extension = filename.split(".").pop();
      const name = filename.split(".").slice(0, -1).join(".");

      const ref = storage.ref(`imagens/${name}.${extension}`);
      console.log(ref);

      const img = await fetch(result.assets[0].uri);
      const bytes = await img.blob();
      const fbResult = await uploadBytes(ref, bytes);

      const Download = await storage
        .ref(fbResult.metadata.fullPath)
        .getDownloadURL();
      setFormCachorro({ ...formCachorro, urlfoto: Download });
    }
  };

  useEffect(() => {
    const subscriber = cachorroRef.onSnapshot((querySnapshot) => {
      const cachorros = [];
      querySnapshot.forEach((documentSnapshot) => {
        cachorros.push({
          ...documentSnapshot.data(),
          key: documentSnapshot.id,
        });
      });
      setCachorros(cachorros);
      setLoading(false);
      setIsRefreshing(false);
    });
    return () => subscriber();
  }, [cachorros]);

  const editCachorro = async (cachorro: Cachorro) => {
    const result = firestore
      .collection("Usuario")
      .doc(auth.currentUser?.uid)
      .collection("Cachorro")
      .doc(cachorro.id)
      .onSnapshot((documentSnapshot) => {
        const cachorro = new Cachorro(documentSnapshot.data());
        setFormCachorro(cachorro);
        console.log(cachorro);
      });
    return () => result();
  };

  const deleteCachorro = async (cachorro: Cachorro) => {
    Alert.alert(
      `Apagar cachorro "${cachorro.nome}?" `,
      "Essa ação não pode ser desfeita!",
      [
        {
          text: "Cancelar",
        },
        {
          text: "Excluir",
          onPress: async () => {
            const res = await cachorroRef
              .doc(cachorro.id)
              .delete()
              .then(() => {
                alert("Cachorro " + cachorro.nome + " excluído!");
                limparFormulario();
                setIsRefreshing(true);
              });
          },
        },
      ]
    );
  };

  const renderCachorros = ({ item }: { item: Cachorro }) => {
    return (
      <View style={meuestilo.item} key={item.id}>
        <Pressable
          onLongPress={() => deleteCachorro(item)}
          onPress={() => editCachorro(item)}
        >
          <View style={meuestilo.alinhamentoLinha}>
            <Image
              style={{ height: 80, width: 80, borderRadius: 10 }}
              source={{ uri: item.urlfoto }}
            />

            <View style={meuestilo.alinhamentoColuna}>
              <Text style={meuestilo.title}>Nome: {item.nome}</Text>
              <Text style={meuestilo.title}>Raça: {item.raca}</Text>
              <Text style={meuestilo.title}>Sexo: {item.sexo}</Text>
              <Text style={meuestilo.title}>Data Nasc: {item.datanasc}</Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <ScrollView>
      <KeyboardAvoidingView style={meuestilo.container}>
        <Pressable onPress={() => escolheFoto()}>
          {pickerImagePath !== "" && (
            <Image source={{ uri: pickerImagePath }} style={meuestilo.image} />
          )}
          {pickerImagePath === "" && (
            <Image
              source={require("../assets/camera.jpg")}
              style={meuestilo.image}
            />
          )}
        </Pressable>

        <View style={meuestilo.inputContainer}>
          <TextInput
            pickerImagePath
            placeholder="Nome"
            style={meuestilo.input}
            value={formCachorro.nome}
            onChangeText={(nome) =>
              setFormCachorro({
                ...formCachorro,
                nome: nome,
              })
            }
          />
          <TextInput
            placeholder="Raca"
            style={meuestilo.input}
            value={formCachorro.raca}
            onChangeText={(raca) =>
              setFormCachorro({
                ...formCachorro,
                raca: raca,
              })
            }
          />
          <TextInput
            placeholder="Sexo"
            style={meuestilo.input}
            value={formCachorro.sexo}
            onChangeText={(sexo) =>
              setFormCachorro({
                ...formCachorro,
                sexo: sexo,
              })
            }
          />
          <TextInput
            placeholder="Data Nascimento"
            style={meuestilo.input}
            value={formCachorro.datanasc}
            onChangeText={(datanasc) =>
              setFormCachorro({
                ...formCachorro,
                datanasc: datanasc,
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
          data={cachorros}
          renderItem={renderCachorros}
          keyExtractor={(item) => item.id.toString()}
          refreshing={isRefreshing}
        />
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default ManterCachorro;
