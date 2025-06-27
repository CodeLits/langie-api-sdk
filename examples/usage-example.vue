<!-- Example: How to properly use the lt component -->
<template>
  <div>
    <!-- Basic usage -->
    <h1><lt>Welcome to our application</lt></h1>

    <!-- With context -->
    <p><lt ctx="navigation">Home</lt></p>

    <!-- With original language specified -->
    <p><lt orig="en">Hello world!</lt></p>

    <!-- Using msg prop instead of slot -->
    <lt msg="This is a message" />

    <!-- With variables (use slot content) -->
    <p>
      <lt>Hello {{ username }}!</lt>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// ✅ Correct import - from components subpackage
import { lt } from 'langie-api-sdk/components'

const username = ref('John')
</script>
