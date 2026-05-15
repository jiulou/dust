import { Flex, IconButton, Input } from "@chakra-ui/react"
import { open } from "@tauri-apps/plugin-dialog"
import { useState } from "react"
import { FiFolder, FiPlus } from "react-icons/fi"

interface ScanInputProps {
  onAdd: (path: string) => void
}

export function ScanInput({ onAdd }: ScanInputProps) {
  const [value, setValue] = useState("")

  const handleAdd = () => {
    const trimmed = value.trim()
    if (trimmed) {
      onAdd(trimmed)
      setValue("")
    }
  }

  const handlePick = async () => {
    const dirs = await open({ directory: true, multiple: true })
    if (dirs) {
      ;(Array.isArray(dirs) ? dirs : [dirs]).forEach((d) => onAdd(d))
    }
  }

  return (
    <Flex gap={2}>
      <Input
        flex={1}
        placeholder="~/projects"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
      />
      <IconButton aria-label="Add path" onClick={handleAdd}>
        <FiPlus />
      </IconButton>
      <IconButton aria-label="Select folder" variant="outline" onClick={handlePick}>
        <FiFolder />
      </IconButton>
    </Flex>
  )
}
