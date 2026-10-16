import {
  Article,
  Footer,
  H1,
  H2,
  H3,
  Header,
  Main,
  Nav,
  P,
  Section,
} from "@expo/html-elements";
import { Link } from "expo-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  ChevronDown,
  CircleHelp,
  Eye,
  HandCoins,
  Landmark,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wallet,
  X,
} from "lucide-react-native";
import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { landingPageContent } from "@/data/landingPage";
import { colors } from "@/theme/colors";

const palette = colors.light;
const contentWidth = 1180;
const headerHeight = 78;

const serviceIcons = {
  users: Users,
  wallet: Wallet,
  handCoins: HandCoins,
  chart: Landmark,
} as const;

const benefitIcons = {
  eye: Eye,
  target: Target,
  shield: ShieldCheck,
} as const;

function Container({ children }: { children: ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

function Copy({ children, style }: ComponentProps<typeof Text>) {
  return <Text style={[styles.copy, style]}>{children}</Text>;
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
  tone?: "light" | "dark";
}) {
  return (
    <View style={[styles.sectionHeading, centered && styles.centeredHeading]}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <H2
        style={[
          styles.sectionTitle,
          centered && styles.centeredText,
          tone === "dark" && styles.darkSectionTitle,
        ]}
      >
        {title}
      </H2>
      <Copy
        style={[
          centered && styles.centeredCopy,
          tone === "dark" && styles.darkSectionCopy,
        ]}
      >
        {description}
      </Copy>
    </View>
  );
}

function ActionLink({
  href,
  label,
  secondary = false,
  compact = false,
}: {
  href: "/(auth)/signup" | "/(auth)/login";
  label: string;
  secondary?: boolean;
  compact?: boolean;
}) {
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        style={({ pressed }) => [
          styles.action,
          secondary ? styles.secondaryAction : styles.primaryAction,
          compact && styles.compactAction,
          pressed && styles.pressedAction,
        ]}
      >
        <Text
          style={secondary ? styles.secondaryActionText : styles.primaryActionText}
        >
          {label}
        </Text>
        {!secondary && <ArrowRight size={17} color={palette.onPrimary} />}
      </Pressable>
    </Link>
  );
}

function LandingHeader({
  mobile,
  menuOpen,
  scrolled,
  onToggleMenu,
  onNavigate,
}: {
  mobile: boolean;
  menuOpen: boolean;
  scrolled: boolean;
  onToggleMenu: () => void;
  onNavigate: (section: string) => void;
}) {
  return (
    <Header
      style={[
        styles.header,
        scrolled ? styles.scrolledHeader : styles.topHeader,
      ]}
    >
      <View style={styles.headerInner}>
        <Pressable
          onPress={() => onNavigate("top")}
          accessibilityRole="link"
          accessibilityLabel="SaveSmart home"
          style={styles.brand}
        >
          <Image
            source={require("../../../assets/images/savesmart-icon.png")}
            style={styles.brandIcon}
            accessibilityLabel="SaveSmart piggy bank logo"
          />
          <Text style={styles.brandName}>SaveSmart</Text>
        </Pressable>
        {!mobile && (
          <Nav accessibilityLabel="Main navigation" style={styles.desktopNav}>
            {landingPageContent.navigation.map((item) => (
              <Pressable
                key={item.section}
                onPress={() => onNavigate(item.section)}
                accessibilityRole="button"
                style={styles.navLink}
              >
                <Text style={styles.navText}>{item.label}</Text>
              </Pressable>
            ))}
          </Nav>
        )}
        {!mobile ? (
          <View style={styles.headerActions}>
            <ActionLink
              href="/(auth)/login"
              label="Log in"
              secondary
              compact
            />
            <ActionLink
              href="/(auth)/signup"
              label="Join our chama"
              compact
            />
          </View>
        ) : (
          <Pressable
            onPress={onToggleMenu}
            accessibilityRole="button"
            accessibilityLabel={menuOpen ? "Close menu" : "Open menu"}
            accessibilityState={{ expanded: menuOpen }}
            hitSlop={8}
            style={styles.menuButton}
          >
            {menuOpen ? (
              <X size={22} color={palette.textPrimary} />
            ) : (
              <Menu size={22} color={palette.textPrimary} />
            )}
          </Pressable>
        )}
      </View>
      {mobile && menuOpen && (
        <View style={styles.mobileMenu}>
          {landingPageContent.navigation.map((item) => (
            <Pressable
              key={item.section}
              onPress={() => onNavigate(item.section)}
              accessibilityRole="button"
              style={styles.mobileNavLink}
            >
              <Text style={styles.navText}>{item.label}</Text>
              <ArrowUpRight size={15} color={palette.muted} />
            </Pressable>
          ))}
          <View style={styles.mobileActions}>
            <ActionLink href="/(auth)/login" label="Log in" secondary />
            <ActionLink href="/(auth)/signup" label="Join our chama" />
          </View>
        </View>
      )}
    </Header>
  );
}

function HeroSection({
  mobile,
  onLearnMore,
}: {
  mobile: boolean;
  onLearnMore: () => void;
}) {
  return (
    <Section style={styles.heroSection}>
      <Container>
        <View style={[styles.hero, mobile && styles.mobileHero]}>
          <View style={styles.heroCopy}>
            <View style={styles.heroEyebrow}>
              <Sparkles size={15} color={palette.primary} />
              <Text style={styles.heroEyebrowText}>
                {landingPageContent.hero.eyebrow}
              </Text>
            </View>
            <H1 style={[styles.heroTitle, mobile && styles.mobileHeroTitle]}>
              {landingPageContent.hero.title}
            </H1>
            <P style={styles.heroDescription}>
              {landingPageContent.hero.description}
            </P>
            <View style={[styles.heroActions, mobile && styles.mobileHeroActions]}>
              <ActionLink href="/(auth)/signup" label="Join our chama" />
              <Pressable
                onPress={onLearnMore}
                accessibilityRole="button"
                style={styles.learnMore}
              >
                <Text style={styles.learnMoreText}>See how it works</Text>
                <ArrowDown size={16} color={palette.textPrimary} />
              </Pressable>
            </View>
            <View style={styles.heroNote}>
              <BadgeCheck size={17} color={palette.success} />
              <Text style={styles.heroNoteText}>
                Your group sets its own contribution goals and terms.
              </Text>
            </View>
          </View>
          <View style={styles.heroVisualWrap}>
            <View style={styles.visualBackdrop} />
            <View style={styles.visualCard}>
              <View style={styles.visualCardTop}>
                <View style={styles.visualTitleGroup}>
                  <View style={styles.visualMark}>
                    <Users size={18} color={palette.onPrimary} />
                  </View>
                  <View>
                    <Text style={styles.visualOverline}>YOUR CHAMA</Text>
                    <Text style={styles.visualTitle}>Progress, together</Text>
                  </View>
                </View>
                <View style={styles.visualBadge}>
                  <Text style={styles.visualBadgeText}>GROUP-LED</Text>
                </View>
              </View>
              <View style={styles.visualDivider} />
              <Text style={styles.visualSectionLabel}>A shared place for</Text>
              {[
                { icon: Wallet, label: "Contribution records", color: "blue" },
                { icon: Target, label: "Group savings goals", color: "green" },
                { icon: HandCoins, label: "Available loan products", color: "gold" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <View key={item.label} style={styles.visualRow}>
                    <View
                      style={[
                        styles.visualRowIcon,
                        item.color === "green"
                          ? styles.greenIcon
                          : item.color === "gold"
                            ? styles.goldIcon
                            : styles.blueIcon,
                      ]}
                    >
                      <Icon
                        size={17}
                        color={
                          item.color === "green"
                            ? "#087B62"
                            : item.color === "gold"
                              ? "#A66B0D"
                              : palette.primary
                        }
                      />
                    </View>
                    <Text style={styles.visualRowText}>{item.label}</Text>
                    <BadgeCheck size={17} color={palette.success} />
                  </View>
                );
              })}
              <View style={styles.visualCardFoot}>
                <Landmark size={15} color={palette.textSecondary} />
                <Text style={styles.visualFootText}>
                  Tools depend on your group’s settings
                </Text>
              </View>
            </View>
            <View style={styles.visualFloat}>
              <Banknote size={18} color="#087B62" />
              <Text style={styles.visualFloatText}>Built around your group</Text>
            </View>
          </View>
        </View>
        <View style={[styles.trustStrip, mobile && styles.mobileTrustStrip]}>
          <TrustItem icon={Users} label="Group membership" detail="Join or create a chama" />
          <TrustItem icon={Wallet} label="Flexible contributions" detail="Group-enabled methods" />
          <TrustItem icon={ShieldCheck} label="Group-led terms" detail="No one-size-fits-all pricing" />
        </View>
      </Container>
    </Section>
  );
}

function TrustItem({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof Users;
  label: string;
  detail: string;
}) {
  return (
    <View style={styles.trustItem}>
      <View style={styles.trustIcon}>
        <Icon size={18} color={palette.primary} />
      </View>
      <View style={styles.trustCopy}>
        <Text style={styles.trustLabel}>{label}</Text>
        <Text style={styles.trustDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function AboutSection({
  mobile,
  onLayout,
}: {
  mobile: boolean;
  onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <Section nativeID="about" onLayout={onLayout} style={styles.section}>
      <Container>
        <View style={[styles.aboutLayout, mobile && styles.mobileAboutLayout]}>
          <View style={styles.aboutLead}>
            <Text style={styles.eyebrow}>ABOUT SAVESMART</Text>
            <H2 style={styles.aboutTitle}>A chama works best when everyone can see the plan.</H2>
          </View>
          <View style={styles.aboutText}>
            <Copy>{landingPageContent.about.description}</Copy>
            <View style={styles.missionVision}>
              <InfoBlock label="Our mission" text={landingPageContent.about.mission} />
              <InfoBlock label="Our vision" text={landingPageContent.about.vision} />
            </View>
          </View>
        </View>
        <View style={[styles.valuesRow, mobile && styles.mobileValuesRow]}>
          <Text style={styles.valuesLabel}>WHAT WE BELIEVE</Text>
          {landingPageContent.about.values.map((value, index) => (
            <View key={value} style={styles.valueItem}>
              <View style={styles.valueDot} />
              <Text style={styles.valueText}>{value}</Text>
              {index < landingPageContent.about.values.length - 1 && (
                <View style={styles.valueDivider} />
              )}
            </View>
          ))}
        </View>
      </Container>
    </Section>
  );
}

function InfoBlock({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function ServicesSection({
  mobile,
  onLayout,
}: {
  mobile: boolean;
  onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <Section
      nativeID="services"
      onLayout={onLayout}
      style={[styles.section, styles.tintedSection]}
    >
      <Container>
        <SectionHeading
          eyebrow="WHAT YOU CAN DO"
          title="Tools for the way your chama works"
          description="Keep the day-to-day group work organized, with contribution and credit options controlled by your chama."
        />
        <View style={[styles.cardGrid, mobile && styles.mobileCardGrid]}>
          {landingPageContent.services.map((service, index) => {
            const Icon = serviceIcons[service.icon];
            return (
              <Article key={service.title} style={styles.serviceCard}>
                <View
                  style={[
                    styles.serviceIcon,
                    index % 2 === 0 ? styles.blueIcon : styles.greenIcon,
                  ]}
                >
                  <Icon
                    size={22}
                    color={index % 2 === 0 ? palette.primary : "#087B62"}
                  />
                </View>
                <H3 style={styles.cardTitle}>{service.title}</H3>
                <Copy style={styles.cardDescription}>{service.description}</Copy>
              </Article>
            );
          })}
        </View>
      </Container>
    </Section>
  );
}

function PackagesSection({
  mobile,
  onLayout,
}: {
  mobile: boolean;
  onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <Section nativeID="packages" onLayout={onLayout} style={styles.section}>
      <Container>
        <SectionHeading
          eyebrow="MEMBERSHIP"
          title="Choose how you want to get started"
          description="SaveSmart does not set fixed membership packages or prices. Contribution targets and group terms are agreed by each chama."
          centered
        />
        <View style={[styles.cardGrid, mobile && styles.mobileCardGrid]}>
          {landingPageContent.membershipPaths.map((path) => (
            <Article
              key={path.name}
              style={[
                styles.pathCard,
                path.featured && styles.featuredPathCard,
                mobile && styles.mobilePathCard,
              ]}
            >
              {path.featured && (
                <View style={styles.recommendedTag}>
                  <Text style={styles.recommendedText}>A fresh start</Text>
                </View>
              )}
              <Text style={styles.pathLabel}>{path.label}</Text>
              <H3 style={styles.pathTitle}>{path.name}</H3>
              <Copy style={styles.cardDescription}>{path.description}</Copy>
              <View style={styles.pathRule} />
              <View style={styles.pathContribution}>
                <Text style={styles.pathContributionLabel}>YOUR CONTRIBUTION</Text>
                <Text style={styles.pathContributionValue}>{path.contribution}</Text>
              </View>
              <ActionLink
                href="/(auth)/signup"
                label="Get started"
                secondary={!path.featured}
              />
            </Article>
          ))}
        </View>
      </Container>
    </Section>
  );
}

function ProductsSection({
  mobile,
  onLayout,
}: {
  mobile: boolean;
  onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <Section
      nativeID="products"
      onLayout={onLayout}
      style={[styles.section, styles.darkSection]}
    >
      <Container>
        <SectionHeading
          eyebrow="GROUP FINANCE"
          title="Useful products, with terms set by your group"
          description="Explore the financial tools SaveSmart supports. What you can access depends on the products and settings your chama has enabled."
          tone="dark"
        />
        <View style={[styles.productGrid, mobile && styles.mobileCardGrid]}>
          {landingPageContent.products.map((product, index) => {
            const Icon = serviceIcons[product.icon];
            return (
              <Article key={product.title} style={styles.productCard}>
                <View style={styles.productCardTop}>
                  <View
                    style={[
                      styles.productIcon,
                      index === 1 ? styles.greenIcon : styles.productIconBlue,
                    ]}
                  >
                    <Icon
                      size={21}
                      color={index === 1 ? "#087B62" : palette.primary}
                    />
                  </View>
                  <ArrowUpRight size={18} color="#91A4C3" />
                </View>
                <H3 style={styles.productTitle}>{product.title}</H3>
                <Copy style={styles.productDescription}>{product.description}</Copy>
                <Text style={styles.productDetail}>{product.detail}</Text>
              </Article>
            );
          })}
        </View>
      </Container>
    </Section>
  );
}

function HowItWorksSection({
  mobile,
  onLayout,
}: {
  mobile: boolean;
  onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <Section nativeID="how-it-works" onLayout={onLayout} style={styles.section}>
      <Container>
        <SectionHeading
          eyebrow="GET STARTED"
          title="From sign-up to shared progress"
          description="A straightforward path into your group’s existing process."
          centered
        />
        <View style={[styles.steps, mobile && styles.mobileSteps]}>
          {landingPageContent.steps.map((step, index) => (
            <View key={step.number} style={[styles.step, mobile && styles.mobileStep]}>
              <View style={styles.stepMarker}>
                <Text style={styles.stepNumber}>{step.number}</Text>
              </View>
              {index < landingPageContent.steps.length - 1 && !mobile && (
                <View style={styles.stepConnector} />
              )}
              <H3 style={styles.stepTitle}>{step.title}</H3>
              <Copy style={styles.stepDescription}>{step.description}</Copy>
            </View>
          ))}
        </View>
      </Container>
    </Section>
  );
}

function BenefitsSection({
  mobile,
  onLayout,
}: {
  mobile: boolean;
  onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <Section
      nativeID="benefits"
      onLayout={onLayout}
      style={[styles.section, styles.benefitsSection]}
    >
      <Container>
        <View style={[styles.benefitsLayout, mobile && styles.mobileBenefitsLayout]}>
          <View style={styles.benefitsLead}>
            <Text style={styles.eyebrow}>WHY SAVESMART</Text>
            <H2 style={styles.benefitsTitle}>Good group habits start with a clear picture.</H2>
            <Copy>
              Keep members connected to the plan without making promises about returns, credit, or outcomes.
            </Copy>
          </View>
          <View style={styles.benefitList}>
            {landingPageContent.benefits.map((benefit) => {
              const Icon = benefitIcons[benefit.icon];
              return (
                <View key={benefit.title} style={styles.benefitItem}>
                  <View style={styles.benefitIcon}>
                    <Icon size={20} color={palette.primary} />
                  </View>
                  <View style={styles.benefitText}>
                    <H3 style={styles.benefitTitle}>{benefit.title}</H3>
                    <Copy>{benefit.description}</Copy>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Container>
    </Section>
  );
}

function FAQSection({
  mobile,
  onLayout,
}: {
  mobile: boolean;
  onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  return (
    <Section
      nativeID="faq"
      onLayout={onLayout}
      style={[styles.section, styles.tintedSection]}
    >
      <Container>
        <View style={[styles.faqLayout, mobile && styles.mobileFaqLayout]}>
          <View style={styles.faqIntro}>
            <View style={styles.faqIcon}>
              <CircleHelp size={24} color={palette.primary} />
            </View>
            <Text style={styles.eyebrow}>GOOD TO KNOW</Text>
            <H2 style={styles.faqTitle}>A few common questions</H2>
            <Copy>
              Group policies can differ. When in doubt, confirm the details with your chama administrators.
            </Copy>
          </View>
          <View style={styles.faqList}>
            {landingPageContent.faqs.map((faq, index) => {
              const expanded = openQuestion === index;
              return (
                <View key={faq.question} style={styles.faqItem}>
                  <Pressable
                    onPress={() => setOpenQuestion(expanded ? null : index)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    style={styles.faqQuestion}
                  >
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                    <ChevronDown
                      size={19}
                      color={palette.textSecondary}
                      style={expanded ? styles.faqChevronOpen : undefined}
                    />
                  </Pressable>
                  {expanded && <Copy style={styles.faqAnswer}>{faq.answer}</Copy>}
                </View>
              );
            })}
          </View>
        </View>
      </Container>
    </Section>
  );
}

function FinalCTASection({
  mobile,
  onLayout,
}: {
  mobile: boolean;
  onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <Section
      onLayout={onLayout}
      style={[styles.finalSection, mobile && styles.mobileFinalSection]}
    >
      <Container>
        <View style={[styles.finalCta, mobile && styles.mobileFinalCta]}>
          <View style={styles.finalCtaCopy}>
            <Text style={styles.finalEyebrow}>YOUR GROUP, YOUR GOALS</Text>
            <H2 style={styles.finalTitle}>Ready to grow together?</H2>
            <Copy style={styles.finalDescription}>
              Start a group or join your chama and bring your shared plan into focus.
            </Copy>
          </View>
          <ActionLink href="/(auth)/signup" label="Join our chama" />
        </View>
      </Container>
    </Section>
  );
}

function LandingFooter({
  mobile,
  onNavigate,
  onLayout,
}: {
  mobile: boolean;
  onNavigate: (section: string) => void;
  onLayout: (event: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <Footer nativeID="contact" onLayout={onLayout} style={styles.footer}>
      <Container>
        <View style={[styles.footerMain, mobile && styles.mobileFooterMain]}>
          <View style={styles.footerBrandBlock}>
            <View style={styles.footerBrand}>
              <Image
                source={require("../../../assets/images/savesmart-icon.png")}
                style={styles.footerLogo}
                accessibilityLabel="SaveSmart piggy bank logo"
              />
              <Text style={styles.footerBrandName}>SaveSmart</Text>
            </View>
            <Copy style={styles.footerDescription}>
              {landingPageContent.brand.description}
            </Copy>
          </View>
          <View style={styles.footerLinksBlock}>
            <Text style={styles.footerHeading}>Explore</Text>
            <View style={styles.footerLinks}>
              {landingPageContent.navigation.slice(0, 6).map((item) => (
                <Pressable
                  key={item.section}
                  onPress={() => onNavigate(item.section)}
                  accessibilityRole="button"
                  style={styles.footerLink}
                >
                  <Text style={styles.footerLinkText}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.footerContactBlock}>
            <Text style={styles.footerHeading}>Contact</Text>
            <Copy style={styles.footerContactText}>
              {landingPageContent.contact.note}
            </Copy>
            <ActionLink
              href="/(auth)/signup"
              label="Create an account"
              secondary
              compact
            />
          </View>
        </View>
        <View style={styles.footerBottom}>
          <Text style={styles.copyright}>
            © {new Date().getFullYear()} SaveSmart. All rights reserved.
          </Text>
          <Text style={styles.footerDisclaimer}>
            Group terms, contribution rules, and product eligibility are set by each chama.
          </Text>
        </View>
      </Container>
    </Footer>
  );
}

export function LandingPage() {
  const { width } = useWindowDimensions();
  const mobile = width < 760;
  const narrow = width < 1080;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<string, number>>({});

  const rememberSection = (section: string) =>
    (event: { nativeEvent: { layout: { y: number } } }) => {
      sectionPositions.current[section] = event.nativeEvent.layout.y;
    };

  const scrollTo = (section: string) => {
    setMenuOpen(false);
    if (section === "top") {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const y = sectionPositions.current[section];
    if (typeof y === "number") {
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
    }
  };

  return (
    <View nativeID="landing-page" style={styles.page}>
      <ScrollView
        ref={scrollRef}
        stickyHeaderIndices={[0]}
        onScroll={(event) => setScrolled(event.nativeEvent.contentOffset.y > 12)}
        scrollEventThrottle={100}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <LandingHeader
          mobile={mobile}
          menuOpen={menuOpen}
          scrolled={scrolled}
          onToggleMenu={() => setMenuOpen((open) => !open)}
          onNavigate={scrollTo}
        />
        <Main>
          <HeroSection mobile={mobile} onLearnMore={() => scrollTo("about")} />
          <AboutSection mobile={narrow} onLayout={rememberSection("about")} />
          <ServicesSection mobile={narrow} onLayout={rememberSection("services")} />
          <PackagesSection mobile={narrow} onLayout={rememberSection("packages")} />
          <ProductsSection mobile={narrow} onLayout={rememberSection("products")} />
          <HowItWorksSection mobile={narrow} onLayout={rememberSection("how-it-works")} />
          <BenefitsSection mobile={narrow} onLayout={rememberSection("benefits")} />
          <FAQSection mobile={narrow} onLayout={rememberSection("faq")} />
          <FinalCTASection mobile={narrow} onLayout={rememberSection("final-cta")} />
        </Main>
        <LandingFooter
          mobile={narrow}
          onNavigate={scrollTo}
          onLayout={rememberSection("contact")}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.surface },
  scrollContent: { flexGrow: 1, backgroundColor: palette.surface },
  container: {
    width: "100%",
    maxWidth: contentWidth,
    alignSelf: "center",
    paddingHorizontal: 28,
  },
  header: {
    width: "100%",
    zIndex: 20,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  topHeader: { backgroundColor: "rgba(255,255,255,0.97)" },
  scrolledHeader: {
    backgroundColor: palette.surface,
    shadowColor: "#10203B",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  headerInner: {
    width: "100%",
    maxWidth: contentWidth,
    minHeight: headerHeight,
    alignSelf: "center",
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandIcon: { width: 34, height: 34, borderRadius: 10 },
  brandName: {
    color: palette.textPrimary,
    fontFamily: "Spline Sans",
    fontSize: 19,
    fontWeight: "700",
  },
  desktopNav: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 19,
  },
  navLink: { paddingVertical: 10 },
  navText: { color: "#41516B", fontSize: 13, fontWeight: "600" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F5FA",
  },
  mobileMenu: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: palette.surface,
    borderTopWidth: 1,
    borderTopColor: palette.divider,
  },
  mobileNavLink: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  mobileActions: { flexDirection: "row", gap: 10, paddingTop: 16 },
  action: {
    minHeight: 48,
    paddingHorizontal: 19,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  compactAction: { minHeight: 40, paddingHorizontal: 14, borderRadius: 10 },
  primaryAction: {
    backgroundColor: palette.primary,
    shadowColor: palette.primary,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  secondaryAction: {
    backgroundColor: "#F2F5FA",
    borderWidth: 1,
    borderColor: palette.border,
  },
  pressedAction: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  primaryActionText: { color: palette.onPrimary, fontSize: 14, fontWeight: "700" },
  secondaryActionText: { color: palette.textPrimary, fontSize: 14, fontWeight: "700" },
  heroSection: { backgroundColor: "#F7F9FE", paddingTop: 62, paddingBottom: 0 },
  hero: {
    minHeight: 430,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 54,
    paddingBottom: 50,
  },
  mobileHero: { flexDirection: "column", alignItems: "stretch", gap: 38, paddingTop: 10 },
  heroCopy: { flex: 1, maxWidth: 560 },
  heroEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 19,
  },
  heroEyebrowText: { color: palette.primary, fontSize: 13, fontWeight: "700" },
  heroTitle: {
    maxWidth: 570,
    color: "#10203B",
    fontFamily: "Spline Sans",
    fontSize: 56,
    lineHeight: 64,
    fontWeight: "700",
    marginBottom: 18,
  },
  mobileHeroTitle: { fontSize: 42, lineHeight: 49 },
  heroDescription: {
    maxWidth: 510,
    color: palette.textSecondary,
    fontSize: 17,
    lineHeight: 28,
  },
  heroActions: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 28 },
  mobileHeroActions: { flexWrap: "wrap", gap: 14 },
  learnMore: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  learnMoreText: { color: palette.textPrimary, fontSize: 14, fontWeight: "700" },
  heroNote: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 23 },
  heroNoteText: { color: palette.textSecondary, fontSize: 12, lineHeight: 18 },
  heroVisualWrap: {
    flex: 1,
    minHeight: 360,
    maxWidth: 500,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  visualBackdrop: {
    position: "absolute",
    width: "86%",
    height: "86%",
    borderRadius: 42,
    backgroundColor: "#E7EDFF",
    transform: [{ rotate: "-7deg" }],
  },
  visualCard: {
    width: "88%",
    minWidth: 300,
    maxWidth: 420,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    borderRadius: 22,
    backgroundColor: palette.surface,
    shadowColor: "#112044",
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  visualCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  visualTitleGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  visualMark: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
  },
  visualOverline: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  visualTitle: { color: palette.textPrimary, fontSize: 14, fontWeight: "700", marginTop: 3 },
  visualBadge: { backgroundColor: "#EAF7F1", borderRadius: 7, paddingHorizontal: 8, paddingVertical: 5 },
  visualBadgeText: { color: "#087B62", fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  visualDivider: { height: 1, backgroundColor: palette.divider, marginVertical: 20 },
  visualSectionLabel: { color: palette.textSecondary, fontSize: 12, marginBottom: 9 },
  visualRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    minHeight: 53,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F4F8",
  },
  visualRowIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  blueIcon: { backgroundColor: "#EEF2FF" },
  greenIcon: { backgroundColor: "#EAF7F1" },
  goldIcon: { backgroundColor: "#FFF5DF" },
  visualRowText: { flex: 1, color: palette.textPrimary, fontSize: 12, fontWeight: "600" },
  visualCardFoot: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 17 },
  visualFootText: { color: palette.textSecondary, fontSize: 10 },
  visualFloat: {
    position: "absolute",
    right: 0,
    bottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: palette.surface,
    shadowColor: "#112044",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  visualFloatText: { color: palette.textPrimary, fontSize: 11, fontWeight: "700" },
  trustStrip: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 22,
    borderTopWidth: 1,
    borderTopColor: "#E6EBF4",
  },
  mobileTrustStrip: { flexDirection: "column", alignItems: "stretch", gap: 0, paddingVertical: 8 },
  trustItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 14 },
  trustIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#EDF2FF" },
  trustCopy: { gap: 3 },
  trustLabel: { color: palette.textPrimary, fontSize: 12, fontWeight: "700" },
  trustDetail: { color: palette.textSecondary, fontSize: 11 },
  section: { paddingVertical: 76, backgroundColor: palette.surface },
  tintedSection: { backgroundColor: "#F6F8FC" },
  sectionHeading: { maxWidth: 650, marginBottom: 34, gap: 10 },
  centeredHeading: { alignSelf: "center", alignItems: "center", marginBottom: 42 },
  centeredText: { textAlign: "center" },
  centeredCopy: { textAlign: "center" },
  eyebrow: { color: palette.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  sectionTitle: { color: "#10203B", fontFamily: "Spline Sans", fontSize: 34, lineHeight: 42, fontWeight: "700" },
  darkSectionTitle: { color: "#FFFFFF" },
  darkSectionCopy: { color: "#B3C0D4" },
  copy: { color: palette.textSecondary, fontSize: 15, lineHeight: 25 },
  aboutLayout: { flexDirection: "row", alignItems: "flex-start", gap: 70 },
  mobileAboutLayout: { flexDirection: "column", gap: 24 },
  aboutLead: { flex: 1, gap: 13 },
  aboutTitle: { color: "#10203B", fontFamily: "Spline Sans", fontSize: 32, lineHeight: 40, fontWeight: "700" },
  aboutText: { flex: 1, gap: 24 },
  missionVision: { flexDirection: "row", gap: 16 },
  infoBlock: { flex: 1, borderLeftWidth: 2, borderLeftColor: palette.primary, paddingLeft: 13, gap: 5 },
  infoLabel: { color: palette.textPrimary, fontSize: 13, fontWeight: "700" },
  infoText: { color: palette.textSecondary, fontSize: 12, lineHeight: 19 },
  valuesRow: { flexDirection: "row", alignItems: "center", gap: 25, marginTop: 48, paddingTop: 22, borderTopWidth: 1, borderTopColor: palette.border },
  mobileValuesRow: { flexWrap: "wrap", gap: 14, marginTop: 34 },
  valuesLabel: { color: palette.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.9 },
  valueItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  valueDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.success },
  valueText: { color: palette.textPrimary, fontSize: 12, fontWeight: "600" },
  valueDivider: { width: 1, height: 16, backgroundColor: palette.border, marginLeft: 15 },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: 18 },
  mobileCardGrid: { flexDirection: "column", gap: 14 },
  serviceCard: { flexBasis: "48%", flexGrow: 1, minWidth: 270, padding: 24, borderWidth: 1, borderColor: palette.border, borderRadius: 15, backgroundColor: palette.surface },
  serviceIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  cardTitle: { color: palette.textPrimary, fontFamily: "Spline Sans", fontSize: 18, lineHeight: 25, fontWeight: "700", marginBottom: 8 },
  cardDescription: { fontSize: 13, lineHeight: 21 },
  pathCard: { flexBasis: "31%", flexGrow: 1, minWidth: 260, minHeight: 330, padding: 24, borderWidth: 1, borderColor: palette.border, borderRadius: 15, backgroundColor: palette.surface, alignItems: "flex-start" },
  mobilePathCard: { minHeight: 0 },
  featuredPathCard: { borderColor: palette.primary, borderWidth: 1.5, backgroundColor: "#F8FAFF" },
  recommendedTag: { position: "absolute", top: 17, right: 18, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: "#E8EEFF" },
  recommendedText: { color: palette.primary, fontSize: 9, fontWeight: "800" },
  pathLabel: { color: palette.primary, fontSize: 10, fontWeight: "800", letterSpacing: 0.7, marginBottom: 9 },
  pathTitle: { color: palette.textPrimary, fontFamily: "Spline Sans", fontSize: 20, lineHeight: 28, fontWeight: "700", marginBottom: 9 },
  pathRule: { alignSelf: "stretch", height: 1, backgroundColor: palette.divider, marginTop: 20, marginBottom: 17 },
  pathContribution: { flex: 1, gap: 7, marginBottom: 18 },
  pathContributionLabel: { color: palette.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.7 },
  pathContributionValue: { color: palette.textPrimary, fontSize: 12, lineHeight: 19, fontWeight: "600" },
  darkSection: { backgroundColor: "#10203B" },
  productGrid: { flexDirection: "row", gap: 16 },
  productCard: { flex: 1, minWidth: 0, padding: 23, borderWidth: 1, borderColor: "#293B5B", borderRadius: 15, backgroundColor: "#172A4A" },
  productCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  productIcon: { width: 45, height: 45, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  productIconBlue: { backgroundColor: "#253B68" },
  productTitle: { color: "#F6F8FC", fontFamily: "Spline Sans", fontSize: 17, lineHeight: 24, fontWeight: "700", marginBottom: 9 },
  productDescription: { color: "#B3C0D4", fontSize: 13, lineHeight: 21 },
  productDetail: { color: "#9BB5FF", fontSize: 10, fontWeight: "700", marginTop: 20 },
  steps: { flexDirection: "row", gap: 18, marginTop: 8 },
  mobileSteps: { flexDirection: "column", gap: 22 },
  step: { flex: 1, position: "relative", alignItems: "flex-start" },
  mobileStep: { flexDirection: "row", alignItems: "flex-start", flexWrap: "wrap", columnGap: 14 },
  stepMarker: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#EDF2FF", marginBottom: 19 },
  stepNumber: { color: palette.primary, fontSize: 12, fontWeight: "800" },
  stepConnector: { position: "absolute", top: 23, left: 60, right: 0, height: 1, backgroundColor: "#DCE4F2" },
  stepTitle: { color: palette.textPrimary, fontSize: 15, lineHeight: 22, fontWeight: "700", marginBottom: 7 },
  stepDescription: { fontSize: 12, lineHeight: 20 },
  benefitsSection: { backgroundColor: "#F0F5FF" },
  benefitsLayout: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 80 },
  mobileBenefitsLayout: { flexDirection: "column", alignItems: "stretch", gap: 32 },
  benefitsLead: { flex: 1, maxWidth: 470, gap: 13 },
  benefitsTitle: { color: "#10203B", fontFamily: "Spline Sans", fontSize: 34, lineHeight: 42, fontWeight: "700" },
  benefitList: { flex: 1, gap: 22 },
  benefitItem: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  benefitIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: palette.surface, alignItems: "center", justifyContent: "center" },
  benefitText: { flex: 1, gap: 3 },
  benefitTitle: { color: palette.textPrimary, fontSize: 15, lineHeight: 21, fontWeight: "700" },
  faqLayout: { flexDirection: "row", alignItems: "flex-start", gap: 70 },
  mobileFaqLayout: { flexDirection: "column", gap: 28 },
  faqIntro: { flex: 0.8, gap: 12 },
  faqIcon: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF0FF", marginBottom: 6 },
  faqTitle: { color: "#10203B", fontFamily: "Spline Sans", fontSize: 32, lineHeight: 40, fontWeight: "700" },
  faqList: { flex: 1.4 },
  faqItem: { borderBottomWidth: 1, borderBottomColor: palette.border },
  faqQuestion: { minHeight: 61, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  faqQuestionText: { flex: 1, color: palette.textPrimary, fontSize: 14, lineHeight: 21, fontWeight: "700" },
  faqChevronOpen: { transform: [{ rotate: "180deg" }] },
  faqAnswer: { paddingBottom: 17, paddingRight: 25, fontSize: 13, lineHeight: 22 },
  finalSection: { paddingVertical: 30, backgroundColor: palette.surface },
  mobileFinalSection: { paddingVertical: 20 },
  finalCta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 25, paddingHorizontal: 42, paddingVertical: 38, borderRadius: 20, backgroundColor: palette.primary },
  mobileFinalCta: { flexDirection: "column", alignItems: "flex-start", paddingHorizontal: 25, paddingVertical: 30 },
  finalCtaCopy: { maxWidth: 590, gap: 8 },
  finalEyebrow: { color: "#DCE5FF", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  finalTitle: { color: "#FFFFFF", fontFamily: "Spline Sans", fontSize: 30, lineHeight: 38, fontWeight: "700" },
  finalDescription: { color: "#E2E9FF", fontSize: 14 },
  footer: { paddingTop: 54, paddingBottom: 22, backgroundColor: "#0B172B" },
  footerMain: { flexDirection: "row", justifyContent: "space-between", gap: 60, paddingBottom: 42 },
  mobileFooterMain: { flexDirection: "column", gap: 30 },
  footerBrandBlock: { flex: 1, maxWidth: 360, gap: 13 },
  footerBrand: { flexDirection: "row", alignItems: "center", gap: 10 },
  footerLogo: { width: 32, height: 32, borderRadius: 9 },
  footerBrandName: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  footerDescription: { color: "#A8B5C9", fontSize: 13, lineHeight: 21 },
  footerLinksBlock: { minWidth: 170, gap: 14 },
  footerHeading: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  footerLinks: { flexDirection: "row", flexWrap: "wrap", gap: 12, maxWidth: 220 },
  footerLink: { paddingVertical: 3, paddingRight: 8 },
  footerLinkText: { color: "#A8B5C9", fontSize: 12 },
  footerContactBlock: { maxWidth: 250, gap: 14 },
  footerContactText: { color: "#A8B5C9", fontSize: 12, lineHeight: 19 },
  footerBottom: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, borderTopWidth: 1, borderTopColor: "#24334A", paddingTop: 18 },
  copyright: { color: "#8190A8", fontSize: 10 },
  footerDisclaimer: { maxWidth: 470, color: "#8190A8", fontSize: 10, lineHeight: 16 },
});