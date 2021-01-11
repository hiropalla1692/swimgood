import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAppContext } from '../../lib/context/state'
import colorPallet from '../../lib/color-pallet'
import Layout, { siteTitle } from '../../components/layout'
import AreaRechart from '../../components/area_rechart'
import BarRechart from '../../components/bar_rechart'
import LineRechart from '../../components/line_rechart'
import ComposedRechart from '../../components/composed_rechart'

import { 
  Box,
  Flex,
  Center,
  Text,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Stack,
  Switch,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react"


export async function getServerSideProps({params}) {
  // Fetch data from external API    
    const symbol = params.symbol;
    const apikey = process.env.FMP_API_KEY;

    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var yesterdayForApi = yesterday.getFullYear() + "-" +  (yesterday.getMonth()+ 1) + "-" + yesterday.getDate();

    var fiveYearsAgo = new Date();
    fiveYearsAgo.setDate(fiveYearsAgo.getDate() - 1824);
    var fiveYearsAgoForApi = fiveYearsAgo.getFullYear() + "-" +  (fiveYearsAgo.getMonth()+ 1) + "-" + fiveYearsAgo.getDate();
    const [res1, res2, res3, res4] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${symbol}?apikey=${apikey}`).then(response => response.json()),
      fetch(`https://financialmodelingprep.com/api/v3/key-metrics/${symbol}?limit=10&apikey=${apikey}`).then(response => response.json()),
      fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${fiveYearsAgoForApi}&to=${yesterdayForApi}&apikey=${apikey}`).then(response => response.json()),
      fetch(`https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apikey}`).then(response => response.json()),
    ]);
    
    const div = res1.historical.slice(0,39).map((divInfo) => ({
      date: divInfo.date.split('-'),
      adjDividend: divInfo.adjDividend,
    }));

    const keyMetrics = res2.map((keyMetric) => ({
      date: keyMetric.date.split('-'),
      dividendYield: keyMetric.dividendYield,
      payoutRatio: keyMetric.payoutRatio,
    }))

    const historicalPrice = res3.historical.map((dailyPrice) => ({
      price: dailyPrice.close,
      date: dailyPrice.date.split('-'),
      volume: dailyPrice.volume,
    }));
  
    const basicInfo = res4.map((Info) => ({
      symbol: Info.symbol,
      name: Info.name,
      price: Info.price,
      marketCap: Info.marketCap,
      changesPercentage: Info.changesPercentage,
      change: Info.change,
      yearHigh: Info.yearHigh,
      yearLow: Info.yearLow,
      exchange: Info.exchange,
      eps: Math.round(Info.eps * 100) / 100,
      pe: Math.round(Info.pe * 100) / 100,
    }))
  
    return { 
      props: { 
        div,
        keyMetrics,
        historicalPrice,
        basicInfo,
      } 
    }
  }


export default function Dividends ({ div, keyMetrics, historicalPrice, basicInfo }) {

  const {setStockPrice, setStockInfo} = useAppContext();

  useEffect(() => {
    setStockPrice(historicalPrice);
    setStockInfo(basicInfo);
  }, [basicInfo])

  const divData = 
  (keyMetrics.length)
  ? keyMetrics.map((each, index) => {
      return(
        {
          date: each.date[1] + "-" + each.date[0],
          dividendYield: Math.round((each.dividendYield*100)*100) / 100,
          payoutRatio: Math.round((each.payoutRatio*100)*100) / 100,
        }
      )
    }).reverse(): [];
  
  const divHistory = 
  (div.length)
  ? div.map((each, index) => {
      return(
        {
          date: each.date[1] + "-" + each.date[0],
          adjDividend: each.adjDividend,
        }
      )
    }).reverse(): [];

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <Flex
        direction="column"
        m="3%"
      >
        <Flex direction="row">
          <Text fontSize="xs" mx="2%">In Millions of USD except per share items</Text>
        </Flex>

        {/* <Flex
          direction="column"
          w="100%"
          h="30vh"
          p="1.5%"
          mt="2%"
          justify="space-around"
          bg='gray.700'
          borderRadius="lg"
        >
          <Flex
            h="92.5%"
            w="100%"
            p="2%"
            bg="gray.800"
            wrap="nowrap"
            justify="space-between"
            fontSize="sm"
            borderRadius="lg"
            boxShadow="md"
          >
            <Flex w="30%" justify="space-between" p="2%" direction="column">
              <Flex justify="center">
                <Text color="teal.300">Margin Metrics</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>Gross Profit Margin</Text>
                <Text>{`${profitData[profitData.length - 1].grossProfitR}%`}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>EBITDA Margin</Text>
                <Text>{`${profitData[profitData.length - 1].ebitdaR}%`}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>Net Profit Margin</Text>
                <Text>{`${profitData[profitData.length - 1].netIncomeR}%`}</Text>
              </Flex>
            </Flex>
            <Flex w="30%" justify="space-between" p="2%" direction="column">
              <Flex justify="center">
                <Text color="teal.300">Return Metrics</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>ROE</Text>
                <Text>{`${profitData[profitData.length - 1].roe}%`}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>ROIC</Text>
                <Text>{`${profitData[profitData.length - 1].roic}%`}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>ROA</Text>
                <Text>{`${profitData[profitData.length - 1].roa}%`}</Text>
              </Flex>
            </Flex>
            <Flex w="30%" justify="space-between" p="2%" direction="column">
              <Flex justify="center">
                <Text color="teal.300">DuPont Analysis</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>Net Profit Margin</Text>
                <Text>{`${profitData[profitData.length - 1].netIncomeR}%`}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>Asset Turnover</Text>
                <Text>{`${profitData[profitData.length - 1].totalAssetTurnover}%`}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text>Equity Multiplier</Text>
                <Text>{`x${profitData[profitData.length - 1].equityMultiplier}`}</Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex> */}

        <Flex
          direction="column"
          w="100%"
          h="50vh"
          p="1.5%"
          mt="2%"
          pt="1%"
          justify="space-between"
          bg='gray.700'
          borderRadius="lg"
        >
          <Flex h="5%" fontWeight="bold" fontSize="sm">
            <Text>&nbsp;&nbsp;■ Dividends</Text>
          </Flex>
          <Flex
            h="92.5%"
            w="100%"
            bg='transparent'
            wrap="nowrap"
            justify="space-around"
            fontSize="xs"
          >
            <Flex w="39%">
              <Flex
                direction="column"
                h="100%"
                w="100%"
                bg="gray.800"
                borderRadius="lg"
                boxShadow="md"
              >
                <Center><Text fontSize="xs" mt="2%">Dividends History</Text></Center>
                <BarRechart data={divHistory} title={["adjDividend"]} color={[colorPallet.profit.green]}/>
              </Flex>
            </Flex>
            <Flex 
              w="59%" 
              wrap="wrap"
              justify="space-around"
            >
              <Flex
                direction="column"
                h="49%"
                w="49%"
                bg="gray.800"
                borderRadius="lg"
                boxShadow="md"
                m="0.4"
                align="center"
              >
                <Text fontSize="xs" mt="2%">Dividends Yield</Text>
                <LineRechart data={divData} title={["dividendYield"]} color={[colorPallet.profit.pink]}/>
              </Flex>
              <Flex
                direction="column"
                h="49%"
                w="49%"
                bg="gray.800"
                borderRadius="lg"
                boxShadow="md"
                m="0.4"
                align="center"
              >
                <Text fontSize="xs" mt="2%">Payout Ratio</Text>
                <LineRechart data={divData} title={["payoutRatio"]} color={[colorPallet.profit.green]}/>
              </Flex>
              {/* <Flex
                direction="column"
                h="49%"
                w="49%"
                bg="gray.800"
                borderRadius="lg"
                boxShadow="md"
                m="0.4"
                align="center"
              >
                <Text fontSize="xs" mt="2%">Asset Turnover</Text>
                <LineRechart data={profitData} title={["totalAssetTurnover"]} color={[colorPallet.profit.orange]}/>
              </Flex>
              <Flex
                direction="column"
                h="49%"
                w="49%"
                bg="gray.800"
                borderRadius="lg"
                boxShadow="md"
                m="0.4"
                align="center"
              >
                <Text fontSize="xs" mt="2%">Equity Multiplier</Text>
                <BarRechart data={profitData} title={["equityMultiplier"]} color={[colorPallet.profit.green]}/>
              </Flex> */}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Layout>
  )
}