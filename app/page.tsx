'use client'

import RichTextEditor from "@/components/editor";
import { ThemeToggle } from "@/components/themeToggle";
import Button from "@/components/ui/buttons/button";
import { DeleteButton } from "@/components/ui/buttons/deleteButton";
import { EditButton } from "@/components/ui/buttons/editButton";
import ButtonIcon from "@/components/ui/buttons/iconButton";
import { ArticleCard } from "@/components/ui/cards/articleCard";
import Counter from "@/components/ui/counter";
import DashboardWidget from "@/components/ui/dashboardWidget";
import Editor from "@/components/ui/editor";
import { SelectDropdown } from "@/components/ui/inputs/dropdown";
import { IconInput } from "@/components/ui/inputs/iconInput";
import { Textarea } from "@/components/ui/inputs/textarea";
import { TextInput } from "@/components/ui/inputs/textInput";
import LogoSelector from "@/components/ui/logoSelector";
import IconTabsMobile from "@/components/ui/menutab";
import MenuTabButton from "@/components/ui/menutab";
import Sticker from "@/components/ui/sticker";
import IconTabs from "@/components/ui/tabview";
import MenuTabs from "@/components/ui/tabviewMobile";
import { UserIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          Theme Test Page
        </h1>
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          This text should change color in dark mode.
        </p>

        <LogoSelector 
          defaultLogo="ghanascore"
          onLogoChange={(logo) => console.log('Selected:', logo.name)}
          className="my-4"
        />
        
        <div className="p-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p>This card should have different backgrounds in light/dark mode.</p>
        </div>

        <Button variant="primary">Get started for free</Button>
        <DashboardWidget/>
        <ArticleCard
  category="Premier League"
  content="Manchester United defeats Liverpool 3-2 in a thrilling match"
  status="published"
  date="Today: 3:20pm"
/>
        <MenuTabs />
        <SelectDropdown
  options={[
    { id: 1, label: "Option 1" },
    { id: 2, label: "Option 2" },
    { id: 3, label: "Option 3" },
  ]}
  placeholder="Choose an option"
  onChange={(opt) => console.log("Selected:", opt)}
/>


        <Textarea placeholder="Write your content here..." />
        <DeleteButton />
        <EditButton />
        <IconInput 
  icon={UserIcon} 
  placeholder="Enter your username" 
/>
        <TextInput 
  placeholder="Enter your username" 
/>
        <Button variant="secondary">Secondary</Button>
         <RichTextEditor />
        <Button variant="outline">Create article</Button>
        <Button variant="ghost">Schedule this post</Button>
        <IconTabsMobile />
              <ButtonIcon icon={UserIcon} text="Account" variant="primary" />
        <Sticker variant="primary">We made everything fresh!</Sticker>
        <Sticker variant="secondary">We made everything fresh!</Sticker>
        <Sticker variant="ghost">We made everything fresh!</Sticker>
        <IconTabs />
        
        <ThemeToggle />
      </div>
    </div>
  )
}
