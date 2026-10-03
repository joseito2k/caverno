import { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import AccountCircle from "@expo/material-symbols/account_circle.xml";
import Logout from "@expo/material-symbols/logout.xml";
import { IconButton } from "@/components/IconButton";
import {
  DropdownMenu,
  DropdownMenuItem,
  Host,
  Icon as EuiIcon,
} from "@expo/ui/jetpack-compose";
import { useAuth } from "@/hooks/useAuth";

export default function UserProfileButton() {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    setShowMenu(false);
    try {
      await signOut();
    } catch (error) {
      Alert.alert(
        "Sign out failed",
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    }
  };

  return (
    <View style={{ height: 44, position: "relative", width: 44 }}>
      <Host matchContents>
        <DropdownMenu
          expanded={showMenu}
          onDismissRequest={() => setShowMenu(false)}
          color="#1f2937"
        >
          <DropdownMenu.Trigger>
            <IconButton
              onPress={() => setShowMenu(true)}
              source={AccountCircle}
              size={24}
              tint="#FFFFFF"
            />
          </DropdownMenu.Trigger>
          <DropdownMenu.Items>
            <DropdownMenuItem onClick={handleSignOut}>
              <DropdownMenuItem.LeadingIcon>
                <EuiIcon source={Logout} size={20} tint="#FFFFFF" />
              </DropdownMenuItem.LeadingIcon>
              <DropdownMenuItem.Text>
                <Text className="text-white">Log out</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          </DropdownMenu.Items>
        </DropdownMenu>
      </Host>
      <View
        pointerEvents="none"
        style={{
          alignItems: "center",
          backgroundColor: "#374151",
          borderRadius: 22,
          height: 44,
          justifyContent: "center",
          left: 0,
          overflow: "hidden",
          position: "absolute",
          top: 0,
          width: 44,
        }}
      >
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            style={{ height: 44, width: 44 }}
          />
        ) : (
          <Text className="text-white text-lg font-semibold">
            {user?.displayName?.charAt(0).toUpperCase() || "?"}
          </Text>
        )}
      </View>
    </View>
  );
}