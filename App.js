import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";

const Stack = createNativeStackNavigator();

const NEWS_ENDPOINT =
  "https://newsapi.org/v2/everything?q=tesla&from=2025-10-26&sortBy=publishedAt&apiKey=0a7d32d015a0438a9f15a5732a43161c";

function NewsListScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      setLoading(true);
      const response = await fetch(NEWS_ENDPOINT);
      const json = await response.json();
      if (json && json.articles) {
        setArticles(json.articles);
      } else {
        setError("Resposta inválida da API");
      }
    } catch (err) {
      setError("Erro ao buscar notícias: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function renderItem({ item }) {
    const image = item.urlToImage;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("NewsDetail", {
            url: item.url,
            title: item.title,
          })
        }
      >
        <Image
          source={image ? { uri: image } : require("./assets/logo.png")}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.source && item.source.name ? item.source.name : ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>Últimas notícias — Tesla</Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.loading}>
          <Text style={{ color: "red" }}>{error}</Text>
          <TouchableOpacity onPress={fetchNews} style={styles.reloadBtn}>
            <Text style={{ color: "white" }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item, idx) => item.url + idx}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

function NewsDetailScreen({ route, navigation }) {
  const { url, title } = route.params || {};
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (title) {
      navigation.setOptions({ title: "Notícia" });
    }
  }, [title]);

  if (!url) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text>URL da notícia não disponível.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webHeader}>
        <Text style={styles.webHeaderTitle} numberOfLines={2}>
          {title}
        </Text>
      </View>

      <WebView
        source={{ uri: url }}
        startInLoadingState={true}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        renderLoading={() => (
          <View style={styles.webLoading}>
            <ActivityIndicator size="large" />
          </View>
        )}
        style={{ flex: 1 }}
      />

      {loading && (
        <View style={styles.webLoadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="NewsList"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="NewsList" component={NewsListScreen} />
        <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: {
    width: 110,
    height: 88,
    backgroundColor: "#ddd",
  },
  cardText: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  reloadBtn: {
    marginTop: 12,
    backgroundColor: "#2b6cb0",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  webHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  webHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  webLoading: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  webLoadingOverlay: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
});
