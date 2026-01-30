/**
 * Generate 1000 High-Value PSEO Pages
 * Batch generation with rate limiting and error handling
 */

// Import strategy
const { generateAllPages } = require('./generate-1000-pages-strategy');
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.quicktrucktax.com';

// Configuration
const BATCH_SIZE = 10; // Generate 10 pages per batch
const DELAY_BETWEEN_PAGES = 2000; // 2 seconds between pages
const DELAY_BETWEEN_BATCHES = 5000; // 5 seconds between batches
const MAX_RETRIES = 3;

// Statistics
const stats = {
  total: 0,
  successful: 0,
  failed: 0,
  skipped: 0,
  retries: 0
};

const results = {
  successful: [],
  failed: [],
  skipped: []
};

async function generatePage(page, retryCount = 0) {
  const { slug, type, context } = page;
  
  try {
    const response = await fetch(`${baseUrl}/api/pseo/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug,
        type,
        context,
        fixIssues: []
      }),
      timeout: 30000 // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        slug,
        url: `${baseUrl}/${slug}`,
        updatedAt: result.updatedAt,
        priority: page.priority,
        category: page.category
      };
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      stats.retries++;
      console.log(`   ⚠️  Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, 3000 * (retryCount + 1))); // Exponential backoff
      return generatePage(page, retryCount + 1);
    }
    
    return {
      success: false,
      slug,
      error: error.message,
      priority: page.priority,
      category: page.category
    };
  }
}

async function generateBatch(pages, batchNumber, totalBatches) {
  console.log(`\n📦 Batch ${batchNumber}/${totalBatches} (${pages.length} pages)`);
  console.log('='.repeat(60));

  const batchResults = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const index = (batchNumber - 1) * BATCH_SIZE + i + 1;
    
    console.log(`\n[${index}/${stats.total}] Generating: ${page.slug}`);
    console.log(`   Type: ${page.type} | Priority: ${page.priority} | Category: ${page.category}`);

    const result = await generatePage(page);
    batchResults.push(result);
    stats.total++;

    if (result.success) {
      stats.successful++;
      results.successful.push(result);
      console.log(`   ✅ Success! ${result.url}`);
    } else {
      stats.failed++;
      results.failed.push(result);
      console.log(`   ❌ Failed: ${result.error}`);
    }

    // Rate limiting between pages
    if (i < pages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_PAGES));
    }
  }

  return batchResults;
}

async function generateAllPagesInBatches() {
  console.log('🚀 Starting 1000-Page Generation Campaign');
  console.log('='.repeat(60));

  const allPages = generateAllPages();
  const totalPages = allPages.length;
  stats.total = totalPages;

  console.log(`📊 Total Pages to Generate: ${totalPages}`);
  console.log(`📦 Batch Size: ${BATCH_SIZE} pages`);
  console.log(`⏱️  Estimated Time: ~${Math.ceil(totalPages / BATCH_SIZE) * (BATCH_SIZE * DELAY_BETWEEN_PAGES / 1000 / 60)} minutes`);
  console.log('\n' + '='.repeat(60));

  // Split into batches
  const batches = [];
  for (let i = 0; i < allPages.length; i += BATCH_SIZE) {
    batches.push(allPages.slice(i, i + BATCH_SIZE));
  }

  const totalBatches = batches.length;
  console.log(`📦 Total Batches: ${totalBatches}`);

  // Process batches
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    await generateBatch(batch, i + 1, totalBatches);

    // Delay between batches (except last batch)
    if (i < batches.length - 1) {
      console.log(`\n⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  // Final Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 GENERATION COMPLETE - FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${stats.successful}/${totalPages} (${((stats.successful / totalPages) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${stats.failed}/${totalPages} (${((stats.failed / totalPages) * 100).toFixed(1)}%)`);
  console.log(`🔄 Retries: ${stats.retries}`);

  // Breakdown by priority
  console.log('\n📈 Breakdown by Priority:');
  const byPriority = {};
  results.successful.forEach(r => {
    if (!byPriority[r.priority]) {
      byPriority[r.priority] = { successful: 0, failed: 0 };
    }
    byPriority[r.priority].successful++;
  });
  results.failed.forEach(r => {
    if (!byPriority[r.priority]) {
      byPriority[r.priority] = { successful: 0, failed: 0 };
    }
    byPriority[r.priority].failed++;
  });

  Object.keys(byPriority).sort().forEach(priority => {
    const { successful, failed } = byPriority[priority];
    const total = successful + failed;
    console.log(`   Priority ${priority}: ${successful}/${total} successful (${((successful / total) * 100).toFixed(1)}%)`);
  });

  // Breakdown by category
  console.log('\n📂 Breakdown by Category:');
  const byCategory = {};
  results.successful.forEach(r => {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  });
  Object.keys(byCategory).sort().forEach(category => {
    console.log(`   ${category}: ${byCategory[category]} pages`);
  });

  // Save results to file
  const fs = require('fs');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsFile = `generation-results-${timestamp}.json`;
  
  fs.writeFileSync(resultsFile, JSON.stringify({
    summary: {
      total: totalPages,
      successful: stats.successful,
      failed: stats.failed,
      retries: stats.retries,
      timestamp: new Date().toISOString()
    },
    successful: results.successful,
    failed: results.failed
  }, null, 2));

  console.log(`\n💾 Results saved to: ${resultsFile}`);

  // Top 20 successful URLs
  if (results.successful.length > 0) {
    console.log('\n✅ Top 20 Successfully Generated Pages:');
    results.successful.slice(0, 20).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.url}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Generation Campaign Complete!');
  console.log('='.repeat(60));

  return {
    total: totalPages,
    successful: stats.successful,
    failed: stats.failed,
    retries: stats.retries,
    successfulUrls: results.successful.map(r => r.url),
    failedSlugs: results.failed.map(r => r.slug)
  };
}

// Run if executed directly
if (require.main === module) {
  generateAllPagesInBatches()
    .then(summary => {
      console.log('\n📋 Final Summary:');
      console.log(JSON.stringify(summary, null, 2));
      process.exit(summary.failed > summary.successful ? 1 : 0);
    })
    .catch(error => {
      console.error('\n💥 Fatal Error:', error);
      process.exit(1);
    });
}

module.exports = { generateAllPagesInBatches };
