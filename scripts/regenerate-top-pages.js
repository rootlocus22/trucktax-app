/**
 * Regenerate Top Priority PSEO Pages
 * Automatically regenerates the top 20 pages with current impressions
 */

const topPages = [
  // High priority - pages with current impressions
  { slug: '2290-tax-for-semi-truck-in-texas', type: 'state-calculator', context: { state: 'Texas', vehicle_type: 'semi-truck' } },
  { slug: '2290-tax-for-semi-truck-in-ohio', type: 'state-calculator', context: { state: 'Ohio', vehicle_type: 'semi-truck' } },
  { slug: '2290-tax-for-semi-truck-in-arizona', type: 'state-calculator', context: { state: 'Arizona', vehicle_type: 'semi-truck' } },
  { slug: '2290-tax-for-dump-truck-in-new-jersey', type: 'state-type', context: { state: 'New Jersey', vehicle_type: 'dump-truck' } },
  { slug: '2290-tax-for-60000-lb-truck-in-alaska', type: 'state-calculator', context: { state: 'Alaska', weight: '60000' } },
  { slug: '2290-tax-for-box-truck-in-georgia', type: 'state-type', context: { state: 'Georgia', vehicle_type: 'box-truck' } },
  { slug: '2290-tax-for-65000-lb-truck-in-alaska', type: 'state-calculator', context: { state: 'Alaska', weight: '65000' } },
  { slug: '2290-tax-for-tow-truck-in-nebraska', type: 'state-type', context: { state: 'Nebraska', vehicle_type: 'tow-truck' } },
  { slug: '2290-tax-for-58000-lb-dump-truck', type: 'calculator', context: { weight: '58000', vehicle_type: 'dump-truck' } },
  { slug: '2290-tax-for-56000-lb-truck-in-wisconsin', type: 'state-calculator', context: { state: 'Wisconsin', weight: '56000' } },
  { slug: '2290-tax-for-66000-lb-truck-in-illinois', type: 'state-calculator', context: { state: 'Illinois', weight: '66000' } },
  { slug: '2290-tax-for-58000-lb-truck-in-alabama', type: 'state-calculator', context: { state: 'Alabama', weight: '58000' } },
  { slug: '2290-tax-for-57000-lb-truck-in-oregon', type: 'state-calculator', context: { state: 'Oregon', weight: '57000' } },
  { slug: '2290-tax-for-74000-lb-truck-in-florida', type: 'state-calculator', context: { state: 'Florida', weight: '74000' } },
  { slug: '2290-tax-for-66000-lb-concrete-mixer', type: 'calculator', context: { weight: '66000', vehicle_type: 'concrete-mixer' } },
  { slug: '2290-tax-for-67000-lb-truck-in-alaska', type: 'state-calculator', context: { state: 'Alaska', weight: '67000' } },
  { slug: '2290-tax-for-concrete-mixer-in-missouri', type: 'state-type', context: { state: 'Missouri', vehicle_type: 'concrete-mixer' } },
  { slug: '2290-tax-for-dump-truck-in-vermont', type: 'state-type', context: { state: 'Vermont', vehicle_type: 'dump-truck' } },
  { slug: '2290-tax-for-73000-lb-truck-in-west-virginia', type: 'state-calculator', context: { state: 'West Virginia', weight: '73000' } },
  { slug: '2290-tax-for-58000-lb-truck-in-california', type: 'state-calculator', context: { state: 'California', weight: '58000' } },
];

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.quicktrucktax.com';

async function regeneratePage(page, index, total) {
  const { slug, type, context } = page;
  
  console.log(`\n[${index + 1}/${total}] Regenerating: ${slug}`);
  console.log(`   Type: ${type}`);
  console.log(`   Context: ${JSON.stringify(context)}`);
  
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
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`   ✅ Success! Updated at: ${result.updatedAt}`);
      console.log(`   📄 URL: ${baseUrl}/${slug}`);
      return {
        success: true,
        slug,
        url: `${baseUrl}/${slug}`,
        updatedAt: result.updatedAt
      };
    } else {
      console.log(`   ❌ Failed: ${result.error || 'Unknown error'}`);
      return {
        success: false,
        slug,
        error: result.error || 'Unknown error'
      };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      success: false,
      slug,
      error: error.message
    };
  }
}

async function regenerateAllPages() {
  console.log('🚀 Starting PSEO Page Regeneration');
  console.log(`📊 Total pages to regenerate: ${topPages.length}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log('\n' + '='.repeat(60));

  const results = [];
  const successful = [];
  const failed = [];

  for (let i = 0; i < topPages.length; i++) {
    const page = topPages[i];
    const result = await regeneratePage(page, i, topPages.length);
    results.push(result);

    if (result.success) {
      successful.push(result);
    } else {
      failed.push(result);
    }

    // Rate limiting: wait 2 seconds between requests to avoid overwhelming the API
    if (i < topPages.length - 1) {
      console.log('   ⏳ Waiting 2 seconds before next request...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 REGENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successful.length}/${topPages.length}`);
  console.log(`❌ Failed: ${failed.length}/${topPages.length}`);

  if (successful.length > 0) {
    console.log('\n✅ Successfully Regenerated Pages:');
    successful.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.url}`);
    });
  }

  if (failed.length > 0) {
    console.log('\n❌ Failed Pages:');
    failed.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.slug} - ${result.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Regeneration Complete!');
  console.log('='.repeat(60));

  return {
    total: topPages.length,
    successful: successful.length,
    failed: failed.length,
    successfulUrls: successful.map(r => r.url),
    failedSlugs: failed.map(r => r.slug)
  };
}

// Run if executed directly
if (require.main === module) {
  regenerateAllPages()
    .then(summary => {
      console.log('\n📋 Final Summary:');
      console.log(JSON.stringify(summary, null, 2));
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('\n💥 Fatal Error:', error);
      process.exit(1);
    });
}

module.exports = { regenerateAllPages, topPages };
