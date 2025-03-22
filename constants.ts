import { StyleSheet } from "react-native";

export const questDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0B0B0B",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#9EFFA9",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
    textShadowColor: "#9EFFA9",
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#A0A0A0",
    textAlign: "center",
    marginBottom: 10,
  },
  timerText: {
    fontSize: 14,
    color: "#BBBBBB",
    textAlign: "center",
    marginBottom: 12,
  },
  timer: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF5555",
    textShadowColor: "#FF5555",
    textShadowRadius: 5,
  },
  progressBar: {
    height: 10,
    borderRadius: 12,
    marginVertical: 12,
    backgroundColor: "#222",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#FFD700",
    fontWeight: "bold",
  },
  streak: {
    fontSize: 16,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  mastery: {
    fontSize: 16,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  failure: {
    fontSize: 14,
    color: "#FF5555",
    textAlign: "center",
    fontWeight: "bold",
  },
  dueDate: {
    fontSize: 14,
    color: "#FFD700",
    textAlign: "center",
    marginBottom: 10,
  },
  taskList: {
    marginTop: 10,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#9EFFA9",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  completedTask: {
    backgroundColor: "#2A2A2A",
  },
  taskIcon: {
    marginRight: 12,
  },
  taskText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F8F8F8",
  },
  completedTaskText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#7C4DFF",
    borderRadius: 10,
    paddingVertical: 12,
    shadowColor: "#A38BFF",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 12,
  },
  backButton: {
    backgroundColor: "#555",
    borderRadius: 10,
    paddingVertical: 12,
  },
});

export const questStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0D0D0D",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 1.2,
    textShadowColor: "#4CAF50",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 18,
  },
  questItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: "#9EFFA9",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  questLeft: {
    marginRight: 12,
  },
  questCenter: {
    flex: 1,
  },
  questRight: {
    marginLeft: 10,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F5F5F5",
    textTransform: "capitalize",
  },
  questSub: {
    fontSize: 13,
    color: "#AAAAAA",
    marginTop: 4,
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 40,
    fontStyle: "italic",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    marginTop: 20,
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: "hidden",
  },

  progressBar: {
    height: 6,
    backgroundColor: "#2C2C2C",
  },
});
