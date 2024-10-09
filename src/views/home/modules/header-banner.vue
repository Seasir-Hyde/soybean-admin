<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useAuthStore } from '@/store/modules/auth';

defineOptions({
  name: 'HeaderBanner'
});

const appStore = useAppStore();
const authStore = useAuthStore();

const gap = computed(() => (appStore.isMobile ? 0 : 16));

interface StatisticData {
  id: number;
  label: string;
  value: string;
}

const statisticData = computed<StatisticData[]>(() => [
  {
    id: 0,
    label: $t('page.home.projectCount'),
    value: '25'
  },
  {
    id: 1,
    label: $t('page.home.todo'),
    value: '4/16'
  },
  {
    id: 2,
    label: $t('page.home.message'),
    value: '12'
  }
]);

// 天气数据
const weatherData = ref({
  city: '',
  temperature: '',
  type: '',
  date: '',
  week: ''
});

// 获取天气信息的函数
const getWeatherInfo = async () => {
  try {
    const response = await fetch('https://api.vvhan.com/api/weather');
    const data = await response.json();
    if (data.success) {
      weatherData.value = {
        city: data.city,
        temperature: `${data.data.low}-${data.data.high}`,
        type: data.data.type,
        date: data.data.date,
        week: data.data.week
      };
    }
  } catch (error) {
    console.error('获取天气信息失败', error);
  }
};

// 储存舔狗日记内容
const diaryContent = ref('');

// 获取舔狗日记的函数
const getDiary = async () => {
  try {
    const response = await fetch('https://api.vvhan.com/api/text/dog?type=json');
    const data = await response.json();

    if (data.success) {
      diaryContent.value = data.data.content; // 获取内容
    } else {
      console.error('获取舔狗日记失败:', data.message);
    }
  } catch (error) {
    console.error('获取舔狗日记失败', error);
  }
};

const init = async () => {
  await getWeatherInfo(); // 获取天气信息
  await getDiary(); // 获取狗狗信息
};

onMounted(async () => {
  await init();
});
</script>

<template>
  <NCard :bordered="false" class="card-wrapper">
    <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
      <NGi span="24 s:24 m:18">
        <div class="flex-y-center">
          <div class="size-72px shrink-0 overflow-hidden rd-1/2">
            <img src="@/assets/imgs/soybean.jpg" class="size-full" />
          </div>
          <div class="pl-12px">
            <h3 class="text-18px font-semibold">
              {{ $t('page.home.greeting', { userName: authStore.userInfo.userName }) }}
            </h3>
            <!-- <p class="text-#999 leading-30px">{{ $t('page.home.weatherDesc') }}</p> -->
            <h2 class="greeting">
              🎉 欢迎来自
              <span class="highlight" style="color: red">{{ weatherData.city }}</span>
              的小伙伴！
            </h2>
            <span>
              今日温度：
              <span class="highlight" style="color: red">{{ weatherData.temperature }}</span>
            </span>
            <span>
              天气：
              <span class="highlight" style="color: red">{{ weatherData.type }}</span>
            </span>
            <span>
              日期：
              <span class="highlight" style="color: red">{{ weatherData.date }}</span>
            </span>
            <span>
              星期：
              <span class="highlight" style="color: red">{{ weatherData.week }}</span>
            </span>
            <h1>舔狗日记：</h1>
            <p v-if="diaryContent">{{ diaryContent }}</p>
            <p v-else>加载中...</p>
          </div>
        </div>
      </NGi>
      <NGi span="24 s:24 m:6">
        <NSpace :size="24" justify="end">
          <NStatistic v-for="item in statisticData" :key="item.id" class="whitespace-nowrap" v-bind="item" />
        </NSpace>
      </NGi>
    </NGrid>
  </NCard>
</template>

<style scoped></style>
