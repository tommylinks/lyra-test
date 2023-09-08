// import DropdownIconButton from '@lyra/ui/components/Button/DropdownIconButton'
import Flex from '@lyra/ui/components/Flex'
// import { IconType } from '@lyra/ui/components/Icon'
import Image from '@lyra/ui/components/Image'
import BaseLink from '@lyra/ui/components/Link/BaseLink'
import Text from '@lyra/ui/components/Text'
import useIsDarkMode from '@lyra/ui/hooks/useIsDarkMode'
import React, { useState } from 'react'

// import { useLocation } from 'react-router-dom'
import { DESKTOP_HEADER_NAV_HEIGHT } from '@/app/constants/layout'
import { LogEvent } from '@/app/constants/logEvents'
import { PageId } from '@/app/constants/pages'
// import TABS from '@/app/constants/tabs'
import AccountButton from '@/app/containers/common/AccountButton'
import getAssetSrc from '@/app/utils/getAssetSrc'
// import { getNavPageFromPath } from '@/app/utils/getNavPageFromPath'
import getPagePath from '@/app/utils/getPagePath'
import logEvent from '@/app/utils/logEvent'

// import LayoutMoreDropdownListItems from './LayoutMoreDropdownListItems'
import LayoutPrivacyModal from './LayoutPrivacyModal'
// import DropdownButtonListItem from "@lyra/ui/components/Button/DropdownButtonListItem";

const SIDE_WIDTH = 420

export default function LayoutDesktopNav(): JSX.Element {
  const [isDarkMode, setIsDarkMode] = useIsDarkMode()
  // const { pathname } = useLocation()
  // const rootPage = getNavPageFromPath(pathname)

  // const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  // const onMoreClose = useCallback(() => setIsMoreOpen(false), [])

  return (
    <Flex
      flexDirection="column"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: DESKTOP_HEADER_NAV_HEIGHT,
        zIndex: 'topNavBar',
      }}
    >
      <Flex
        height={DESKTOP_HEADER_NAV_HEIGHT}
        sx={{
          backdropFilter: 'blur(50px)',
        }}
        justifyContent="center"
      >
        <Flex width="100%" px={6}>
          <Flex alignItems="center" width={SIDE_WIDTH}>
            <BaseLink display="flex" alignItems="center" href={getPagePath({ page: PageId.TradeIndex })}>
              <Image src={getAssetSrc('/options/images/perpy-logo.svg')} color={'red'} height={32} width={32} />
              <Text variant={'logo'} ml={1}>
                PERPY
              </Text>
            </BaseLink>
          </Flex>
          <Flex flexGrow={1} alignItems={'center'} justifyContent={'center'}>
            {/*{TABS.map(tab => (*/}
            {/*  <Link*/}
            {/*    key={tab.path}*/}
            {/*    mr={6}*/}
            {/*    href={tab.path}*/}
            {/*    variant="bodyMedium"*/}
            {/*    color={rootPage !== tab.rootPageId ? 'secondaryText' : 'text'}*/}
            {/*    onClick={() => logEvent(LogEvent.NavPortfolioTabClick)}*/}
            {/*  >*/}
            {/*    {tab.name}*/}
            {/*  </Link>*/}
            {/*))}*/}
          </Flex>
          <Flex width={SIDE_WIDTH} justifyContent={'flex-end'} alignItems={'center'}>
            <Flex
              mr={6}
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                logEvent(LogEvent.NavLightModeToggle, {
                  type: !isDarkMode ? 'light' : 'dark',
                })
                setIsDarkMode(!isDarkMode)
              }}
            >
              <Image
                src={getAssetSrc(`/options/images/${isDarkMode ? 'dark' : 'light'}-theme.svg`)}
                height={23}
                width={23}
              />
            </Flex>

            {/*<DropdownButtonListItem*/}
            {/*  onClick={() => {*/}
            {/*    logEvent(LogEvent.NavLightModeToggle, {*/}
            {/*      type: !isDarkMode ? 'light' : 'dark',*/}
            {/*    })*/}
            {/*    setIsDarkMode(!isDarkMode)*/}
            {/*  }}*/}
            {/*  label={isDarkMode ? 'Light Mode' : 'Dark Mode'}*/}
            {/*  icon={isDarkMode ? IconType.Sun : IconType.Moon}*/}
            {/*/>*/}
            <AccountButton mr={2} />
            {/*<DropdownIconButton*/}
            {/*  isOpen={isMoreOpen}*/}
            {/*  onClose={onMoreClose}*/}
            {/*  onClick={() => setIsMoreOpen(true)}*/}
            {/*  icon={IconType.MoreHorizontal}*/}
            {/*  variant={isDarkMode ? 'static' : 'white'}*/}
            {/*>*/}
            {/*  <LayoutMoreDropdownListItems onClose={onMoreClose} onClickPrivacy={() => setIsPrivacyOpen(true)} />*/}
            {/*</DropdownIconButton>*/}
            <LayoutPrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
