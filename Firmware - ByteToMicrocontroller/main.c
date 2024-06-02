#include "stm32f091xc.h"
#include "stdio.h"
#include "stdbool.h"
#include "leds.h"
#include "buttons.h"
#include "usart2.h"

void SystemClock_Config(void);
void InitIo(void);
void WaitForMs(uint32_t timespan);

uint8_t count = 0;
volatile uint32_t ticks = 0;

int main(void)
{
    SystemClock_Config();  // Configure the system clock
    InitIo();              // Initialize I/O (buttons in this case)
    InitLeds();            // Initialize LEDs
    InitUsart2(9600);      // Initialize USART2 with a baud rate of 9600

    StringToUsart2("Reboot");  // Send "Reboot" message via USART2

    while (1)
    {
        // Main loop
    }
}

void USART2_IRQHandler(void)
{
    if((USART2->ISR & USART_ISR_RXNE) == USART_ISR_RXNE)
    {
        // Byte ontvangen, lees hem om alle vlaggen te wissen.
        uint8_t temp = USART2->RDR;
        ByteToLeds(temp);  // Display the byte value on LEDs
    }
}

void InitIo(void)
{
    // Initialize buttons
    // Add your button initialization code here if needed
}

void SysTick_Handler(void)
{
    ticks++;
}

void WaitForMs(uint32_t timespan)
{
    uint32_t startTime = ticks;
    while(ticks < startTime + timespan);
}

void SystemClock_Config(void)
{
    RCC->CR |= RCC_CR_HSITRIM_4; // HSITRIM op 16 zetten, dit is standaard (ook na reset).
    RCC->CR  |= RCC_CR_HSION;    // Internal high speed oscillator enable (8MHz)
    while((RCC->CR & RCC_CR_HSIRDY) == 0); // Wacht tot HSI zeker ingeschakeld is

    RCC->CFGR &= ~RCC_CFGR_SW; // System clock op HSI zetten (SWS is status geupdatet door hardware)
    while((RCC->CFGR & RCC_CFGR_SWS) != RCC_CFGR_SWS_HSI); // Wachten tot effectief HSI in actie is getreden

    RCC->CR &= ~RCC_CR_PLLON; // Eerst PLL uitschakelen
    while((RCC->CR & RCC_CR_PLLRDY) != 0); // Wacht tot PLL zeker uitgeschakeld is

    RCC->CFGR |= RCC_CFGR_PLLSRC_HSI_PREDIV; // HSI/PREDIV selected as PLL input clock
    RCC->CFGR2 |= RCC_CFGR2_PREDIV_DIV2; // prediv = /2 => 4MHz
    RCC->CFGR |= RCC_CFGR_PLLMUL12; // PLL multiplied by 12 => 48MHz

    FLASH->ACR |= FLASH_ACR_LATENCY; // Meer dan 24 MHz, dus latency op 1

    RCC->CR |= RCC_CR_PLLON; // PLL inschakelen
    while((RCC->CR & RCC_CR_PLLRDY) == 0); // Wacht tot PLL zeker ingeschakeld is

    RCC->CFGR |= RCC_CFGR_SW_PLL; // PLLCLK selecteren als SYSCLK (48MHz)
    while((RCC->CFGR & RCC_CFGR_SWS) != RCC_CFGR_SWS_PLL); // Wait until the PLL is switched on

    RCC->CFGR |= RCC_CFGR_HPRE_DIV1; // SYSCLK niet meer delen, dus HCLK = 48MHz
    RCC->CFGR |= RCC_CFGR_PPRE_DIV1; // HCLK niet meer delen, dus PCLK = 48MHz

    SystemCoreClockUpdate(); // Nieuwe waarde van de core frequentie opslaan in SystemCoreClock variabele
    SysTick_Config(48000);   // Interrupt genereren. Zie core_cm0.h, om na ieder 1ms een interrupt te hebben op SysTick_Handler()
}

