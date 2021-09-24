
import React from 'react'
import { FormField } from '@sanity/base/components'
import { TextInput, Button, Flex, Card, Box, } from '@sanity/ui'
import PatchEvent, { set, unset } from '@sanity/form-builder/PatchEvent'
import { useId } from "@reach/auto-id" // hook to generate unique IDs be sure to npm i auto-id
import { withDocument } from 'part:@sanity/form-builder'
import readingTime from "reading-time"
import client from "part:@sanity/base/client"

const ReadingTime = React.forwardRef((props, ref) => {
  const {
    document,
    type,         // Schema information
    value,        // Current field value
    readOnly,     // Boolean if field is not editable
    placeholder,  // Placeholder text from the schema
    markers,      // Markers including validation rules
    presence,     // Presence information for collaborative avatars
    compareValue, // Value to check for "edited" functionality
    onFocus,      // Method to handle focus state
    onBlur,       // Method to handle blur state  
    onChange      // Method to handle patch events
  } = props
  const { _id } = document
  // Creates a unique ID for our input
  const inputId = useId()

  // Creates a change handler for patching data
  const generateReadingTime = React.useCallback(
    // useCallback will help with performance
    async (event) => {
      const data = await client.withConfig({ apiVersion: "2021-08-29" }).fetch(`
      *[_id == $id][0] {
          "desc": pt::text(body)
      }
      `, { id: _id })
      const descText = data ? data.desc : ""
      const readingTimeText = readingTime(descText).text
      // console.log("readingTime", readingTimeText);
      onChange(PatchEvent.from(readingTimeText ? set(readingTimeText) : unset()))
    },
    [onChange, _id]
  )

  const handleChange = React.useCallback(
    // useCallback will help with performance
    (event) => {
      const inputValue = event.currentTarget.value // get current value
      // if the value exists, set the data, if not, unset the data
      onChange(PatchEvent.from(inputValue ? set(inputValue) : unset()))
    },
    [onChange]
  )

  return (
    <FormField
      description={type.description}  // Creates description from schema
      title={type.title}              // Creates label from schema title
      __unstable_markers={markers}    // Handles all markers including validation
      __unstable_presence={presence}  // Handles presence avatars
      compareValue={compareValue}     // Handles "edited" status
      inputId={inputId}               // Allows the label to connect to the input field
    >
      <Flex align="center">
        <Box flex={1}>
          <TextInput
            id={inputId}                  // A unique ID for this input
            onChange={handleChange}       // A function to call when the input value changes

            value={value}                 // Current field value
            readOnly={readOnly}           // If "readOnly" is defined make this field read only
            placeholder={placeholder}     // If placeholder is defined, display placeholder text
            onFocus={onFocus}             // Handles focus events
            onBlur={onBlur}               // Handles blur events
            ref={ref}
          />
        </Box>
        <Flex marginLeft={1}>
          <Button onClick={generateReadingTime} text="Generate" as={Card} paddingX={3} scheme="light" />
        </Flex>
      </Flex>
    </FormField>
  )
}
)

// Create the default export to import into our schema
export default withDocument(ReadingTime)
