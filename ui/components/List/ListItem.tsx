import Text from '@lyra/ui/components/Text'
import React from 'react'
import { Box, Flex } from 'rebass'

import Center from '../Center'
import { IconType } from '../Icon'
import IconOrImage from '../Icon/IconOrImage'
import BaseLink from '../Link/BaseLink'

export type ListItemProps = {
  label: React.ReactNode | string
  sublabel?: React.ReactNode | string | null
  icon?: IconType | string | React.ReactNode | null
  rightContent?: IconType | string | React.ReactNode | null
  onClick?: (e: any) => void
  isDisabled?: boolean
  isSelected?: boolean
  target?: string
  href?: string
  children?: React.ReactNode
}

export type ListItemElement = React.ReactElement<ListItemProps>

export default function ListItem({
  label,
  sublabel,
  icon,
  rightContent,
  onClick,
  isDisabled,
  isSelected,
  target,
  href,
  children,
}: ListItemProps): ListItemElement {
  return (
    <>
      <Box
        as="li"
        overflow="hidden"
        variant="listItem"
        className={isDisabled ? 'disabled' : undefined}
        sx={{
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
        onClick={onClick}
      >
        <Flex
          as={href ? BaseLink : 'div'}
          href={href}
          target={target}
          alignItems="center"
          justifyContent="flex-start"
          p={[3, 2]}
          height="100%"
          sx={{
            textDecoration: 'none',
            color: isDisabled ? 'disabledText' : isSelected ? 'text' : 'secondaryText',
            bg: !isDisabled && isSelected ? 'hover' : null,
            ':hover': {
              color: isDisabled ? 'disabledText' : 'text',
            },
          }}
        >
          {icon ? (
            <Center mr={[3, 2]}>
              {typeof icon === 'string' ? (
                <IconOrImage src={icon} mt={['2.5px', 0]} size={[18, 16]} color="currentColor" />
              ) : (
                icon
              )}
            </Center>
          ) : null}
          <Flex flexGrow={1} flexDirection="column">
            {typeof label === 'string' || typeof label === 'number' ? (
              <Text variant="small" color="inherit">
                {label}
              </Text>
            ) : (
              label
            )}
            {sublabel != null &&
              (typeof sublabel === 'string' || typeof sublabel === 'number' ? (
                <Text variant="small">{sublabel}</Text>
              ) : (
                sublabel
              ))}
          </Flex>
          {rightContent ? (
            <Center height="100%" pl={3}>
              <Box>
                {typeof rightContent === 'string' ? <IconOrImage src={rightContent} size={18} /> : rightContent}
              </Box>
            </Center>
          ) : null}
        </Flex>
      </Box>
      {children}
    </>
  )
}
